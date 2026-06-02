# 知微 · 算法推理服务（集成桥）

把算法团队的 EHG 早产风险模型（《最终版本（完整模型）5 十折.py》）接入知微桌面端。
原脚本只做 10 折交叉验证、不保存模型；这里补上"训练保存 + 在线推理服务"，并让服务实现
知微前端约定的 `IRiskEngine` REST 契约，前端无需改业务代码即可接入。

## 架构

```
四导联 EHG 设备/Mock  ──(20Hz 帧)──▶  知微前端  ──POST /v1/evaluate──▶  algo/serve.py (本模型)
                                         ◀──── RiskEngineResponse ────
```

- `zhiwei_model.py`：从训练脚本抽取的"建模 + 预处理"（带通 0.3–3Hz、z-score、3s/60点窗、MS-CACNN+CSAF+TCN）。
- `train_and_save.py`：在 `0.mat`/`1.mat` 全量数据上训练单个模型，保存 `artifacts/`。
- `serve.py`：FastAPI 服务，加载工件，实现 `GET /health` 与 `POST /v1/evaluate`。

## 环境（重要）

TensorFlow 暂不支持 Python 3.13/3.14，请用 **Python 3.10–3.12**：

```bash
cd D:\software\prelude\algo
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 1) 训练并保存模型

把 `0.mat`、`1.mat` 放在 `D:\software\prelude`（默认）下，然后：

```bash
python train_and_save.py --data-dir "D:\software\prelude" --epochs 60
# 生成 artifacts/model.weights.h5、zscore.npz、meta.json
```

## 2) 启动推理服务

```bash
uvicorn serve:app --host 127.0.0.1 --port 8000
# 健康检查： curl http://127.0.0.1:8000/health
```

## 3) 在知微桌面端接入

1. 启动 App（演示模式默认开，波形持续流动）。
2. 进入 **医生端 → 设置 → 算法服务对接**。
3. 地址填 `http://127.0.0.1:8000`，点「检测连通性」确认 `status: ready`。
4. 点「接入真实算法」。此后在线风险评估（含孕妇端首页风险环、专业模式概率、医生端可解释性）
   全部改由真实模型输出。
5. 想无硬件联调：保持「数据源 = Mock」让窗口持续产生，「算法 = 真实」用模型评估这些窗口。

> 未启动服务或未训练模型时，`/health` 返回 `unavailable`，前端如实显示"等待算法服务接入"，不会编造分数。

## 契约对照（与 zhiwei/docs/INTEGRATION.md 一致）

- 请求 `POST /v1/evaluate`：`{ schemaVersion, patientId, gestationalAgeDays, riskFactors, window: EHGFrame[] }`
  - 服务取 `window` 内每帧 `ehg`（4 导联）末尾 60 点 → 带通+z-score → 模型。
- 响应：`{ ok: true, assessment: { pretermRiskScore, riskLevel, contractionState, contractionIntensity, features, explanation } }`
  - 失败：`{ ok: false, reason, message }`（窗口不足 / 模型未加载等）。
