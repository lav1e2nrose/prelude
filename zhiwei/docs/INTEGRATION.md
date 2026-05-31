# 知微 · 技术对接文档（INTEGRATION）

本文件是交给**硬件团队**与**算法团队**的接入契约。前端（本仓库）只依赖这两个契约，不依赖具体实现。
只要硬件按 §2 经 BLE 发送数据帧、算法团队按 §3 实现服务，**前端无需改动业务代码即可投入临床试用**。

- 设备侧契约：`src/data/IDataSource.ts`、`src/types/signal.ts`
- 算法侧契约：`src/data/IRiskEngine.ts`
- Electron 注入桥：`src/types/desktop.d.ts`（`window.zhiwei.desktop.devices`）

---

## 1. 总体数据流

```
四导联 EHG 设备 ──BLE──▶ Electron 主进程(noble) ──IPC──▶ 渲染进程(BLEDataSource)
                                                              │
                                          采集/缓冲/显示用滤波 │ 60s 窗口
                                                              ▼
                                              算法服务(算法团队) ◀──REST/WS── RemoteRiskEngine
                                                              │
                                              ProcessedFrame(风险+解释) ▶ UI 实时展示/告警
```

- 本端**不实现风险算法**。本端把最近窗口（默认 60 帧）发给算法服务，拿回 `RiskAssessment`。
- 算法未接入时，前端如实显示"等待算法服务接入"，**不编造分数**，告警系统不基于假分数触发。

---

## 2. 设备侧契约（硬件团队）

### 2.1 BLE GATT 定义

| 项 | UUID（示例，最终由硬件确认后回填） | 属性 | 说明 |
|----|-----------------------------------|------|------|
| Service | `0000A100-0000-1000-8000-00805F9B34FB` | — | 知微 EHG 服务 |
| Stream  | `0000A101-0000-1000-8000-00805F9B34FB` | Notify | 推送数据帧（见 §2.3 二进制布局） |
| Control | `0000A102-0000-1000-8000-00805F9B34FB` | Write  | 接收控制指令（见 §2.4） |
| DeviceInfo | `0000A103-0000-1000-8000-00805F9B34FB` | Read | 序列号 / 固件 / 型号 |

### 2.2 数据帧 JSON 结构（`EHGFrame`，主进程拆包后传给渲染进程）

```ts
interface EHGFrame {
  schemaVersion: number          // 帧结构版本，当前 1
  deviceId: string               // 设备序列号
  seq: number                    // 单调递增帧序号，用于丢包检测
  sampleRateHz: number           // 采样率，如 20
  timestamp: number              // 设备采样时刻 Unix ms（设备 RTC；本端做时钟偏移校正）
  ehg: number[]                  // 四导联 EHG 原始值 μV，长度 4
  fetalHR?: number               // 胎心率 bpm（无能力/无信号时省略或 null）
  maternalHR: number             // 母体心率 bpm
  fetalMovement?: 0 | 1          // 设备侧胎动判定（无能力时省略）
  imu: { ax:number; ay:number; az:number; gx:number; gy:number; gz:number } // 加速度 g / 角速度 dps
  electrodeQuality: number       // 综合电极贴合质量 0-100
  electrodeChannels?: number[]   // 每导联电极贴合质量 0-100，长度 4
  batteryLevel: number           // 0-100
  posture: 'standing'|'sitting'|'lying_left'|'lying_right'|'lying_back'|'unknown'
}
```

### 2.3 数据帧二进制布局（小端，定长，尾部 CRC）

```
offset 0  : u8    schemaVersion
offset 1  : u32   seq
offset 5  : u64   timestamp (ms)
offset 13 : u8    sampleRateHz
offset 14 : i16×4 ehg[ch1..ch4]      (μV ×100 定点)
offset 22 : i16   maternalHR
offset 24 : i16   fetalHR            (0x7FFF = null)
offset 26 : u8    fetalMovement      (0 / 1 / 255=null)
offset 27 : i16×6 imu(ax,ay,az,gx,gy,gz) (定点 ×1000)
offset 39 : u8×4  electrodeChannels[ch1..ch4]
offset 43 : u8    batteryLevel
offset 44 : u8    posture (0..5 枚举顺序同上)
offset 45 : u16   CRC-16/CCITT (offset 0..44)
帧长 = 47 字节
```

> `electrodeQuality` 由本端取四导联均值得出。丢包以 `seq` 检测，UI 标注数据缺口，不静默插值。

### 2.4 控制指令（`DeviceControlCommand`，前端 → 设备）

```ts
type DeviceControlCommand =
  | { type: 'recalibrate' }            // 重置电极基线
  | { type: 'set_sample_rate'; hz:number }
  | { type: 'identify' }               // 设备指示灯/蜂鸣定位
```

### 2.5 Electron 注入桥（主进程实现，渲染进程消费）

主进程用 noble 实现 BLE，并经 `contextBridge` 暴露 `window.zhiwei.desktop.devices`：

```ts
devices: {
  scanBLE?: () => Promise<DeviceInfo[]>                 // 扫描可用设备
  connectBLE: (config?) => Promise<void>                // 连接指定设备
  disconnectBLE: () => Promise<void>
  sendBLEControl?: (cmd: DeviceControlCommand) => Promise<void>
  onBLEFrame: (cb:(frame:EHGFrame)=>void) => ()=>void   // 订阅帧（已拆包为 EHGFrame）
  onBLEStatus: (cb:(status:ConnectionStatus)=>void) => ()=>void
  onBLEError: (cb:(message:string)=>void) => ()=>void
}
// DeviceInfo: { deviceId, model, firmware, rssi? }
```

### 2.6 连接状态机（`ConnectionStatus`）

```
idle → scanning → pairing → connected
connected →(链路中断)→ reconnecting → connected | error
任意态 →disconnect()→ idle
```

断链重连指数退避：1s,2s,4s,…上限 30s。连接时做一次设备 RTC 校时并记录 offset，所有展示用校正后时间。

---

## 3. 算法侧契约（算法团队）

实现满足以下契约的服务即可接入；前端通过 `RemoteRiskEngine`（`src/data/engines/RemoteRiskEngine.ts`）调用。

### 3.1 请求 `RiskEngineRequest`

```ts
interface RiskEngineRequest {
  schemaVersion: 1
  patientId: string
  gestationalAgeDays: number        // 当前孕龄（天），由前端按预产期实时计算
  riskFactors: RiskFactorCode[]     // 高危因素枚举（见 src/types/user.ts）
  window: EHGFrame[]                 // 最近 N 秒原始帧窗口（默认 60s @ 20Hz）
}
// RiskFactorCode: advanced_maternal_age|ivf|twin|multiple|cervical_insufficiency
//                 |preterm_history|tocolysis|gdm|hypertension
```

### 3.2 响应 `RiskEngineResponse`

```ts
type RiskEngineResponse =
  | { ok: true; assessment: RiskAssessment }
  | { ok: false; reason: 'unavailable'|'auth'|'bad_request'|'timeout'|'model_error'; message: string }

interface RiskAssessment {
  pretermRiskScore: number          // 0-100
  riskLevel: 'safe'|'attention'|'alert'|'emergency'
  contractionState: 'rest'|'active'|'peak'|'recovery'
  contractionIntensity: number      // 0-1
  features: EHGFeatures             // bandpower/medianFrequency/.../pretermProbability24h/7d
  explanation: RiskExplanation      // 可解释性：SHAP 贡献/反事实/类比患者/盲区/CI（见 src/types/signal.ts）
}
```

> 每个评估都必须带 `explanation`：医生端要求评分可解释、可质疑、可覆盖，不允许黑箱。

### 3.3 端点

| 用途 | 协议 | 地址 | 说明 |
|------|------|------|------|
| 流式实时评估 | WebSocket | `wss://<algo-host>/v1/stream` | 客户端按节奏发 `RiskEngineRequest`，服务端推 `RiskEngineResponse` |
| 一次性评估 | REST | `POST {baseUrl}/v1/evaluate` | 请求体 `RiskEngineRequest`，响应 `RiskEngineResponse`，用于回放/报告离线评估 |

- **鉴权**：`Authorization: Bearer <token>`。
- **超时/降级**：单次评估 > 3s 视为 `timeout`；连续失败 → `status='unavailable'` → 前端显示"等待算法服务"。
- **版本**：`schemaVersion` 双向校验，不匹配返回 `bad_request`。

---

## 4. 错误码与可恢复性

设备/算法错误统一结构：`{ code: string; message: string; recoverable: boolean }`。
可恢复错误自动重试（重连/重发），不可恢复错误提示用户并保留人工通道。

---

## 5. 联调与开发模式

后端就绪前，前端可在 **设置 → 数据接入 / 算法服务** 切换到 Mock 数据源与 Mock 算法（或点"一键演示模式"）。
开启任一 Mock 时，全局常驻"开发模式"横幅（`DevModeBanner`），明确标注非临床数据。
生产默认：真实 BLE 设备 + 远程算法服务；无设备/未接入算法时如实呈现真实状态，不回退到 Mock。
