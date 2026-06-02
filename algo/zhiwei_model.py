"""
知微 · EHG 早产风险模型（可复用模块）

从训练脚本《最终版本（完整模型）5 十折.py》中抽取出"建模 + 预处理"部分，
供训练保存（train_and_save.py）与在线推理服务（serve.py）共同复用，保证
线上线下使用完全一致的网络结构与预处理流程。

输入约定：4 导联 EHG，采样率 20 Hz，3 秒窗（60 点）。模型输出 sigmoid =
该窗为"早产(标签=1)"的概率。
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, filtfilt

# ===== 基本配置（与训练脚本保持一致） =====
FS = 20.0
WIN_SEC = 3.0
WIN_LEN = int(round(FS * WIN_SEC))  # 60
CHANNELS = 4
CONV_KERNEL_SIZES = (3, 7, 15, 31)
ATTENTION_HEADS = 1
DROPOUT = 0.2
LSTM_UNITS = 64
CLASSIFIER = "tcn"
MODEL_VERSION = "MS-CACNN-CSAF-v1"


# ===== 预处理 =====
def bandpass_filter(sig, fs: float = FS, low: float = 0.3, high: float = 3.0, order: int = 4):
    """对 (T,C) 信号做带通滤波（与训练一致：0.3–3 Hz）。"""
    nyq = 0.5 * fs
    b, a = butter(order, [low / nyq, high / nyq], btype="band")
    return filtfilt(b, a, sig, axis=0)


def zscore_apply(X, mu, std):
    """应用训练集拟合得到的 z-score 参数。X:(N,T,C) 或 (T,C)。"""
    mu = np.asarray(mu, dtype=np.float32)
    std = np.asarray(std, dtype=np.float32)
    return (X - mu.reshape(1, 1, -1)) / std.reshape(1, 1, -1)


def zscore_fit(X):
    flat = X.reshape(-1, X.shape[-1])
    mu, std = flat.mean(axis=0), flat.std(axis=0)
    std[std < 1e-8] = 1e-8
    return mu.astype(np.float32), std.astype(np.float32)


def cut_windows(sig_TxC, win_len: int = WIN_LEN, overlap: float = 0.5):
    """把一条 (T,C) 信号切成 (N_win, win_len, C)。"""
    T, _C = sig_TxC.shape
    hop = max(1, int(win_len * (1 - overlap)))
    starts = np.arange(0, T - win_len + 1, hop, dtype=int)
    if len(starts) == 0:
        return np.empty((0, win_len, sig_TxC.shape[1]), dtype=np.float32)
    return np.stack([sig_TxC[s : s + win_len, :] for s in starts], axis=0).astype(np.float32)


# ===== 模型（与训练脚本实际使用的 TCN 分支一致） =====
def _multi_scale_conv_branches(x, layers, filters=32, kernel_sizes=CONV_KERNEL_SIZES, name="msc"):
    outs = []
    for k in kernel_sizes:
        out = layers.Conv1D(filters, k, padding="same", activation="relu", name=f"{name}_conv{k}")(x)
        out = layers.BatchNormalization(name=f"{name}_bn{k}")(out)
        outs.append(out)
    return outs


def _csaf_fusion_simplified(branches, raw, layers, tf, name="csaf"):
    F = branches[0].shape[-1]
    x_concat = layers.Concatenate(name=f"{name}_concat_branches")(branches)
    x_fused = layers.Conv1D(F, 1, padding="same", activation="relu", name=f"{name}_concat_proj")(x_concat)
    x_fused = layers.BatchNormalization(name=f"{name}_concat_bn")(x_fused)

    def rhythm_mean_op(z):
        return tf.reduce_mean(z, axis=-1, keepdims=True)

    rhythm = layers.Lambda(rhythm_mean_op, output_shape=lambda s: (s[0], s[1], 1), name=f"{name}_rhythm_mean")(raw)
    rhythm = layers.Conv1D(16, 15, padding="same", activation="relu", name=f"{name}_rhythm_smooth")(rhythm)
    rhythm = layers.BatchNormalization(name=f"{name}_rhythm_bn")(rhythm)
    rhythm = layers.Bidirectional(layers.GRU(32, return_sequences=True), name=f"{name}_rhythm_bigru")(rhythm)
    attn_weights = layers.Dense(1, activation="sigmoid", name=f"{name}_attn_weight")(rhythm)
    weighted = layers.Multiply(name=f"{name}_weight_apply")([x_fused, attn_weights])
    output = layers.Add(name=f"{name}_residual")([x_fused, weighted])
    output = layers.BatchNormalization(name=f"{name}_output_bn")(output)
    return output


def build_model(input_len: int = WIN_LEN, channels: int = CHANNELS, classifier: str = CLASSIFIER,
                branch_filters: int = 32, lstm_units: int = LSTM_UNITS, dropout: float = DROPOUT,
                lr: float = 5e-4):
    """构建与训练脚本一致的 MS-CACNN+CSAF+TCN 模型。"""
    import tensorflow as tf  # 延迟导入，避免无 TF 环境下导入本模块即报错
    from tensorflow import keras
    from tensorflow.keras import layers

    inp = layers.Input(shape=(input_len, channels), name="ehg_input")
    branches = _multi_scale_conv_branches(inp, layers, filters=branch_filters, name="msc")
    fused = _csaf_fusion_simplified(branches, raw=inp, layers=layers, tf=tf, name="csaf")

    if classifier.lower() == "tcn":
        x = layers.Conv1D(64, 5, padding="same", activation="relu", name="tcn_conv1")(fused)
        x = layers.Conv1D(64, 5, padding="same", activation="relu", name="tcn_conv2")(x)
        x = layers.GlobalAveragePooling1D(name="tcn_gap")(x)
    else:
        x = layers.Bidirectional(layers.LSTM(lstm_units, return_sequences=True), name="bilstm_1")(fused)
        x = layers.Bidirectional(layers.LSTM(lstm_units), name="bilstm_2")(x)

    x = layers.Dropout(dropout, name="head_dropout")(x)
    out = layers.Dense(1, activation="sigmoid", name="cls")(x)

    model = keras.Model(inp, out, name="MS_CACNN_CSAF_RhythmAttn")
    model.compile(optimizer=keras.optimizers.Adam(lr), loss="binary_crossentropy",
                  metrics=[keras.metrics.AUC(name="AUC"), "accuracy"])
    return model
