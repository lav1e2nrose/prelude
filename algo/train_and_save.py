"""
训练并保存可部署的模型工件。

原训练脚本只做 10 折交叉验证、不保存模型；本脚本在全量数据上训练单个模型，
并保存推理服务所需的工件：
  artifacts/model.weights.h5   网络权重
  artifacts/zscore.npz         训练集 z-score 参数（mu/std）
  artifacts/meta.json          模型版本 / 窗长 / 通道数 / 采样率

用法：
  python train_and_save.py --data-dir "D:\\software\\prelude" --epochs 60
数据：同目录下的 0.mat（标签0）与 1.mat（标签1）。
"""
from __future__ import annotations

import argparse
import json
import os

import numpy as np
from scipy.io import loadmat
from sklearn.model_selection import train_test_split

from zhiwei_model import (
    CHANNELS,
    FS,
    MODEL_VERSION,
    WIN_LEN,
    bandpass_filter,
    build_model,
    cut_windows,
    zscore_apply,
    zscore_fit,
)

POS_OVERLAP, NEG_OVERLAP = 0.6, 0.25
SEED = 42
ARTIFACT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "artifacts")


def _records_from_mat(path):
    d = loadmat(path, squeeze_me=True, struct_as_record=False)
    data = d["data"]
    if not (isinstance(data, np.ndarray) and data.dtype == object):
        raise ValueError(f"{path}: data 不是 cell array")
    return [np.asarray(x, dtype=float) for x in data]


def _build_dataset(data_dir):
    X_all, y_all = [], []
    rm = int(180 * FS)
    for label in (0, 1):
        path = os.path.join(data_dir, f"{label}.mat")
        records = _records_from_mat(path)
        windows = []
        for sig in records:
            sig_f = bandpass_filter(sig, fs=FS)
            if sig_f.shape[0] <= 2 * rm:
                continue
            sig_f = sig_f[rm:-rm, :]
            overlap = POS_OVERLAP if label == 1 else NEG_OVERLAP
            w = cut_windows(sig_f, WIN_LEN, overlap=overlap)
            if w.shape[0]:
                windows.append(w)
        if not windows:
            continue
        Xw = np.concatenate(windows, axis=0)
        X_all.append(Xw)
        y_all.append(np.full((Xw.shape[0],), label, dtype=np.int32))
        print(f"[{os.path.basename(path)}] 窗口数={Xw.shape[0]}")
    X = np.concatenate(X_all, axis=0)
    y = np.concatenate(y_all, axis=0)
    print(f"[汇总] X={X.shape} 标签分布={dict(zip(*np.unique(y, return_counts=True)))}")
    return X, y


def main():
    import tensorflow as tf
    from tensorflow import keras

    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", default=os.path.dirname(ARTIFACT_DIR))
    ap.add_argument("--epochs", type=int, default=60)
    ap.add_argument("--batch-size", type=int, default=32)
    args = ap.parse_args()

    np.random.seed(SEED)
    tf.random.set_seed(SEED)
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    X, y = _build_dataset(args.data_dir)
    X_tr, X_va, y_tr, y_va = train_test_split(X, y, test_size=0.1, stratify=y, random_state=SEED)

    mu, std = zscore_fit(X_tr)
    X_tr = zscore_apply(X_tr, mu, std)
    X_va = zscore_apply(X_va, mu, std)

    model = build_model(input_len=X.shape[1], channels=X.shape[2])
    model.summary()
    model.fit(
        X_tr, y_tr,
        validation_data=(X_va, y_va),
        epochs=args.epochs,
        batch_size=args.batch_size,
        callbacks=[
            keras.callbacks.EarlyStopping(monitor="val_AUC", mode="max", patience=12, restore_best_weights=True),
            keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5, min_lr=1e-6),
        ],
        verbose=1,
    )

    model.save_weights(os.path.join(ARTIFACT_DIR, "model.weights.h5"))
    np.savez(os.path.join(ARTIFACT_DIR, "zscore.npz"), mu=mu, std=std)
    with open(os.path.join(ARTIFACT_DIR, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(
            {"modelVersion": MODEL_VERSION, "winLen": WIN_LEN, "channels": int(X.shape[2]), "fs": FS},
            f, ensure_ascii=False, indent=2,
        )
    print(f"[完成] 工件已保存到 {ARTIFACT_DIR}")


if __name__ == "__main__":
    main()
