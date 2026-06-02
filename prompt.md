# 知微 (ZhīWēi) · 早产风险实时监测平台 — 生产级前端规格 v3

你是一名顶级全栈工程师，同时具备医疗级软件的 UI/UX 审美和母婴医疗领域的人文敏感度，并且**写过真正上市的医疗器械配套软件**。

你现在要构建一个名为 **"知微"** 的 PC 桌面应用程序（Electron），用于早产高危孕妇的子宫肌电（EHG）实时监测与早产预警。

> **见微知著** —— 通过便携式四导联子宫肌电监测装置，在临床症状出现前数小时识别早产先兆，给高危孕妇、家属、产科医生三个角色提供差异化的信息呈现。

---

## PART 0 · 产品定位与工程前提（必读，决定一切实现决策）

### 0.1 这是一个真实产品，不是演示，不是 toy example

**这一版是整套系统的"前端先行部分"。** 真实的硬件已经存在：一台四导联 EHG 采集设备，通过**蓝牙（BLE）**向外发送数据帧。本端软件负责：

1. 通过 BLE 真实地连接设备、接收数据帧、解析、缓冲；
2. 把数据按契约转发给**算法服务端**（早产风险算法由算法团队后续接入），拿回风险评分与可解释性结果；
3. 把实时风险、波形、宫缩、告警呈现给三类用户；
4. 把事件与配置真实地持久化。

**交付目标（验收的唯一标准）：**

> 当真实设备接上蓝牙、算法团队拿到本仓库附带的《技术对接文档》并实现了约定接口后，**这个软件无需改动业务代码即可投入临床试用**。它不是"看起来能用"，而是"接上就能用"。

### 0.2 三条不可妥协的工程红线

1. **真实数据优先，Mock 仅供开发。** 默认数据源是真实 BLE 设备 + 真实算法服务。Mock 数据源/Mock 算法引擎只能作为**开发者设置**里的一个可显式开启的选项存在，且开启时全局有"开发模式"标识。生产构建可通过环境变量将 Mock 代码整体排除。**禁止**把 Mock 当作默认主流程、禁止在登录页/主界面暴露 Mock 场景选择器。

2. **禁止编造数据冒充真实数据。** 任何尚未从设备/算法/用户档案拿到的数据，界面必须呈现"加载中 / 无数据 / 未连接 / 等待算法服务"等**真实状态**，**绝不允许**用硬编码假值（如组件里写死 `孕 32 周 + 3 天`、`78%`、`已连接`）冒充。所有展示数据必须可溯源到：设备帧、算法响应、用户档案、或用户本人录入。

3. **契约先行。** 设备侧（BLE）与算法侧（风险引擎）都通过明确的 TypeScript 接口契约解耦。本端只依赖契约，不依赖具体实现。两个契约连同二进制/JSON schema 一并产出为《技术对接文档》（PART 4），这是交给硬件团队和算法团队的东西。

### 0.3 真实用户画像（影响所有页面决策）

**孕妇端用户**：孕 24–37 周，被诊断为早产高危（高龄/试管/双胎/宫颈机能不全/有早产史/保胎中）。可能长期卧床；焦虑水平显著高于普通孕妇；相当一部分是高知人群，**想懂自己的数据，不愿被当病人哄**；视觉疲劳明显，对突发刺激敏感。

**家属端用户**：丈夫为主，真实场景常是多人协作（丈夫上班 + 长辈陪护 + 月嫂介入 + 异地父母关注）。核心需求是分工协调，避免"信息黑洞"和"重复响应"。

**医生端用户**：三甲医院产科 / 产科 ICU 医生。需要临床决策依据。**医生不会盲信 AI**，需要算法解释"为什么是这个评分"，且能在不同意时优雅地覆盖。

### 0.4 设计哲学（九条，每条在后续规格里都有对应实现）

1. **分层信息架构（Progressive Disclosure）**：默认极简，每一层都可展开到更专业的深度。不假设用户看不懂复杂信息。
2. **医疗器械的温度版**：克制的深色专业感 + 暖色调点缀，不做"少女母婴 App"。
3. **倒计时取消范式**：所有紧急动作（呼叫家属/120/报警）走"3 秒倒计时自动执行 + 巨大取消按钮"，而非"滑动确认"。
4. **分级唤醒**：警报先视觉变化 → 渐强提示音 → 全屏覆盖，禁止突发刺激。
5. **情感语言克制**：默认说"你的身体状态"，不说"宝宝"。
6. **假阳性的优雅处理**：用户可标记"这次预警不准"，进入算法反馈队列。
7. **记忆模式（Memorial Mode）**：必须有"标记孕程结束 / 进入静默 / 删除情感化提醒"入口（详见 PART 15，伦理底线）。
8. **三端数据流必须自洽**：孕妇端产生的每条数据，都要明确它如何呈现给家属和医生。
9. **AI 透明化**：任何风险评分都必须可解释、可质疑、可覆盖。不允许黑箱。

---

## PART 1 · 技术栈（不可妥协）

```
桌面框架:   Electron（frameless window，自定义标题栏，contextIsolation:true，nodeIntegration:false）
前端框架:   React 19 + TypeScript（严格模式，零 any，零 @ts-ignore）
构建工具:   Vite
样式方案:   Tailwind CSS（核心工具类）+ CSS Variables（主题）
动画:       CSS transition/keyframes（如引入 Framer Motion 须遵守 PART 10 动画禁区）
图表:       D3.js（热力图、波形图、SHAP、反事实可视化）；轻量统计图可自绘 SVG
状态管理:   Zustand（全局状态 + 数据流）
设备接入:   Electron 主进程 ↔ Node.js（noble / @abandonware/noble 做 BLE；serialport 做串口降级），
            经 IPC（contextBridge）暴露给渲染进程。真实可运行，不是空壳。
算法接入:   IRiskEngine 契约 —— 远程实现走 WebSocket/REST，本地实现走 IPC 调用算法模块
本地存储:   electron-store（事件日志、用户配置、会话）持久化
日历:       自实现（不用第三方）
图标:       Lucide React 或等价 SVG
字体:       Inter / DM Sans / Source Han Sans
PDF 导出:   主进程 puppeteer-core / Electron printToPDF
```

**真实性要求**：BLE 接入层（noble）和 IPC 桥必须真实写出，能在有设备时真正扫描/连接/订阅特征。无设备时进入真实的"未发现设备"状态，**不是**直接 fallback 到 Mock。

---

## PART 2 · 设计系统

### 2.1 双主题色彩（医生端/家属端深色 + 孕妇端暖光，同一 App 内并存）

```css
:root {
  /* 状态色（克制版，避免警报性饱和度） */
  --safe:        #5B8C5A;  --safe-glow:   rgba(91,140,90,0.25);
  --attention:   #C99846;  --attention-glow: rgba(201,152,70,0.25);
  --alert:       #C85C50;  --alert-glow:  rgba(200,92,80,0.30);
  --critical:    #B23A48;  /* 仅救命级警报 */

  /* 信号通道色（四导联 EHG） */
  --ehg-ch1:#D4A574; --ehg-ch2:#C29076; --ehg-ch3:#A87968; --ehg-ch4:#8E665A;
  --fhr-color:#6B9080; --mhr-color:#A4727B;

  /* SHAP / 可解释性 */
  --shap-positive:#C85C50; --shap-negative:#6B9080; --shap-neutral:#8B8580;

  /* 品牌 */
  --accent:#6B7E8C; --accent-dim:rgba(107,126,140,0.15);
}

[data-theme="pro"] {     /* 医生端 + 家属端 */
  --bg-0:#0F1114; --bg-1:#16191D; --bg-2:#1D2126; --bg-3:#252A30;
  --border-subtle:#252A30; --border-default:#353B42; --border-emphasis:#4A5158;
  --text-primary:#E8E6E1; --text-secondary:#9A958D; --text-muted:#5C5852;
  --heat-0:#1D2126; --heat-1:#3A2A1F; --heat-2:#6B4530; --heat-3:#9B6440; --heat-4:#D08850;
}

[data-theme="warm"] {    /* 孕妇端 */
  --bg-0:#F5F1EA; --bg-1:#FAF7F1; --bg-2:#FFFFFF; --bg-3:#EFEAE0;
  --border-subtle:#E8E0D2; --border-default:#D6CCB8; --border-emphasis:#B8AC95;
  --text-primary:#2C2A26; --text-secondary:#6B665E; --text-muted:#A39B8E;
  --safe:#6FA56E; --attention:#D9A455; --alert:#D26B5F;
}
```

### 2.2 字体与字号

```css
--font-display:'DM Sans','Source Han Sans SC',sans-serif;
--font-body:'Inter','Source Han Sans SC',sans-serif;
--font-mono:'JetBrains Mono',monospace;

/* 孕妇端字号比医生端大一档（视觉疲劳考虑） */
[data-theme="warm"] { --text-base:16px; --text-lg:19px; --text-xl:24px; --text-2xl:32px; --text-3xl:44px; --line-height-base:1.65; }
[data-theme="pro"]  { --text-base:14px; --text-lg:16px; --text-xl:20px; --text-2xl:28px; --text-3xl:36px; --line-height-base:1.5;  }
```

### 2.3 组件规范

- `border-radius`：医生端 6px / 暖光端 14px
- `box-shadow`：医生端 `0 1px 3px rgba(0,0,0,0.4)` / 暖光端 `0 2px 12px rgba(120,100,70,0.08)`
- 可交互元素：`transition: all 200ms cubic-bezier(0.25,0.1,0.25,1)`；按下 `scale(0.97)`
- **孕妇端主按钮：最小高度 52px**，padding x 24px；医生端最小按钮高度 32px

---

## PART 3 · 数据与集成架构（系统的核心，必须严格实现）

### 3.1 三层架构与两个外部契约

```
┌───────────────┐   BLE 契约    ┌──────────────────────────┐   IRiskEngine 契约   ┌───────────────┐
│  四导联 EHG    │ ───────────▶ │  知微前端（本仓库）        │ ──────────────────▶ │  风险算法服务   │
│  采集设备      │  (硬件团队)   │  采集 · 缓冲 · 展示 · 告警  │  (算法团队后续实现)  │  EHG-Net 等    │
└───────────────┘ ◀─────────── └──────────────────────────┘ ◀────────────────── └───────────────┘
                   控制/校准                                   ProcessedFrame + 解释
```

- **本端不实现风险算法**。本端通过 `IRiskEngine` 把缓冲窗口送出去，拿回 `ProcessedFrame`（含风险与解释）。在算法端接入前，`IRiskEngine` 的真实实现返回"算法服务不可用"状态，界面如实呈现"等待算法服务接入"，**不编造分数**。
- 本端**可以**做的轻量信号处理（与算法端解耦、纯前端可独立完成的）：带通/陷波滤波用于波形显示、运动伪迹/电极松动的客观标记、跌倒检测（基于 IMU 阈值）。这些是显示与安全降级用途，**不替代**算法端的风险判定。

### 3.2 设备数据帧 —— 真实硬件输出契约（`src/types/signal.ts`）

> 这是硬件团队必须按此格式经 BLE 发送的内容。字段命名、单位、范围即契约。

```typescript
export interface EHGFrame {
  schemaVersion: 1                 // 帧结构版本，用于前后兼容
  deviceId: string                 // 设备序列号（来自设备信息特征）
  timestamp: number                // 设备采样时刻，Unix ms（设备 RTC；本端做时钟偏移校正）
  seq: number                      // 单调递增帧序号，用于丢包检测
  sampleRateHz: number             // 采样率（如 20）
  ehg: [number, number, number, number]  // 四导联 EHG 原始值，单位 μV
  maternalHR: number               // 母体心率 bpm
  fetalHR: number | null           // 胎心率 bpm（设备不支持/无信号时为 null）
  fetalMovement: 0 | 1 | null      // 设备侧胎动判定（无能力时 null）
  imu: { ax:number; ay:number; az:number; gx:number; gy:number; gz:number }  // 加速度 g / 角速度 dps
  electrodeQuality: [number, number, number, number]  // 每导联贴合质量 0-100
  batteryLevel: number             // 0-100
  posture: 'standing'|'sitting'|'lying_left'|'lying_right'|'lying_back'|'unknown'
}
```

二进制布局、字节序、特征拆包细节见 PART 4（技术对接文档）。

### 3.3 数据源契约 `IDataSource`（真实优先）

```typescript
// src/data/IDataSource.ts
export type ConnectionStatus =
  | 'idle'          // 未开始
  | 'scanning'      // 正在扫描设备
  | 'pairing'       // 正在配对/建立连接
  | 'connected'     // 已连接并在接收数据
  | 'reconnecting'  // 连接中断，自动重连中
  | 'error'         // 出错（见 lastError）
  | 'mock'          // 开发模式：Mock 数据源（全局须有开发标识）

export interface DeviceInfo { deviceId:string; firmware:string; model:string }

export interface IDataSource {
  readonly kind: 'ble' | 'serial' | 'websocket' | 'mock'
  readonly status: ConnectionStatus
  scan(): Promise<DeviceInfo[]>                         // 真实扫描（mock 返回固定列表）
  connect(deviceId?: string): Promise<void>
  disconnect(): Promise<void>
  sendControl(cmd: DeviceControlCommand): Promise<void> // 校准/重置电极基线等
  onFrame(cb:(f:EHGFrame)=>void): () => void
  onStatusChange(cb:(s:ConnectionStatus)=>void): () => void
  onError(cb:(e:DeviceError)=>void): () => void
}

export type DeviceControlCommand =
  | { type:'recalibrate' } | { type:'set_sample_rate'; hz:number } | { type:'identify' }

export interface DeviceError { code:string; message:string; recoverable:boolean }
```

实现：

- `BLEDataSource`（**默认/生产**）：经 IPC 调用主进程 noble，真实扫描/连接/订阅 notify 特征、解析帧、写控制特征。
- `SerialDataSource`：串口降级通道，骨架完整可用。
- `WebSocketDataSource`：当设备数据先汇聚到院内网关时，从网关订阅帧。
- `MockDataSource`（**仅开发**）：按场景脚本产生帧，仅在开发者设置开启。

### 3.4 连接状态机（必须真实，禁止默认"已连接"）

```
idle → scan() → scanning → connect() → pairing → connected
connected → (链路中断) → reconnecting → connected | error
任意态 → disconnect() → idle
```

UI 必须严格映射真实状态：未连接时监测页不能显示"监测中"；无设备时显示"未发现设备 / 去连接"；重连时显示重连进度。**连接徽章颜色与文案由 `status` 驱动，不得写死。**

### 3.5 算法服务契约 `IRiskEngine` —— 交给算法团队的对接点

```typescript
// src/data/IRiskEngine.ts
export interface RiskEngineRequest {
  schemaVersion: 1
  patientId: string
  gestationalAgeDays: number          // 当前孕龄（天），来自档案
  riskFactors: RiskFactorCode[]       // 高危因素（来自档案）
  window: EHGFrame[]                   // 最近 N 秒原始帧窗口（如 60s @ 20Hz）
  clientFeatures?: Partial<EHGFeatures>// 本端已算的显示用特征（可选，算法端可忽略）
}

export type RiskEngineResponse =
  | { ok:true; result: ProcessedFrame }
  | { ok:false; reason:'unavailable'|'auth'|'bad_request'|'timeout'|'model_error'; message:string }

export interface IRiskEngine {
  readonly status: 'unavailable' | 'connecting' | 'ready'
  /** 流式：持续送窗口，持续回结果（WebSocket）。返回退订函数。 */
  subscribe(getRequest:()=>RiskEngineRequest, cb:(r:RiskEngineResponse)=>void): () => void
  /** 一次性：用于回放/报告等离线评估（REST）。 */
  evaluate(req: RiskEngineRequest): Promise<RiskEngineResponse>
}
```

实现：

- `RemoteRiskEngine`（**生产**）：WebSocket 流式 + REST 一次性，地址/鉴权在设置中配置。**算法团队只需实现服务端满足本契约即可接入，无需改前端业务代码。**
- `MockRiskEngine`（**仅开发**）：本地按特征生成 `ProcessedFrame` 与解释，仅开发者设置开启。
- **未接入时**：`RemoteRiskEngine.status==='unavailable'`，界面所有风险位显示"等待算法服务接入"，告警系统不基于编造分数触发。

### 3.6 处理结果与可解释性（`ProcessedFrame` / `RiskExplanation`）

```typescript
export interface ProcessedFrame extends EHGFrame {
  contractionState: 'rest'|'active'|'peak'|'recovery'
  contractionIntensity: number
  pretermRiskScore: number                  // 0-100
  riskLevel: 'safe'|'attention'|'alert'|'emergency'
  artifacts: ('movement'|'electrode_loose'|'power_line'|'maternal_breathing')[]
  features: EHGFeatures
  explanation: RiskExplanation              // 每个结果都带可解释性
}

export interface EHGFeatures {
  bandpower:{low:number;high:number}; medianFrequency:number; peakFrequency:number
  rmsAmplitude:number; contractionsPerHour:number; contractionRegularity:number
  contractionPropagationVelocity:number; pretermProbability24h:number; pretermProbability7d:number
}

export interface RiskExplanation {
  modelVersion:string
  confidence:number                          // 0-1
  confidenceInterval:[number,number]         // 95% CI
  featureContributions:FeatureContribution[] // SHAP 风格
  oodScore:number                            // 分布外检测 0-1
  similarPatients:SimilarPatient[]
  counterfactuals:Counterfactual[]
  knownLimitations:string[]
}

export interface FeatureContribution { featureName:string; displayName:string; currentValue:number; baselineValue:number; contribution:number; unit:string }
export interface SimilarPatient { anonymizedId:string; similarityScore:number; gestationalWeekAtMeasurement:number; actualOutcome:'term_delivery'|'preterm_24h'|'preterm_7d'|'preterm_28d'|'unknown'; outcomeNote?:string }
export interface Counterfactual { scenario:string; conditionChanges:Record<string,number>; resultingRiskScore:number; resultingRiskChange:number; actionability:'modifiable'|'fixed' }
```

事件、宫缩、医生覆盖、家属协作等结构沿用既有定义（`ContractionEvent`/`DoctorOverride`/`GuardianMember`/`OnCallSchedule`/`AlertResponse`/`AlertCoordinationState`），保持原契约不变。

### 3.7 用户档案与会话（真实身份来源）

```typescript
// src/types/user.ts
export type UserRole = 'patient' | 'guardian' | 'doctor'

export interface AuthSession { token:string; expiresAt:number; userId:string; role:UserRole }

export interface PatientProfile {
  patientId:string; displayName:string
  dueDate:number                  // 预产期（Unix ms）→ 孕周由此与当前时间真实计算
  conceptionMethod:'natural'|'ivf'; pregnancyType:'singleton'|'twin'|'multiple'
  riskFactors:RiskFactorCode[]; attendingDoctorId:string
  boundDeviceId:string|null
}
```

> **孕周、距预产期天数等一律由 `dueDate` 与真实当前时间计算，禁止任何组件硬编码"孕 32 周 + 3 天"。** 姓名、高危因素、主治医生均来自档案。

### 3.8 Zustand 状态（贴合真实数据流）

```typescript
interface AppStore {
  // 会话与身份（角色绑定，见 PART 5）
  session:AuthSession|null
  profile:PatientProfile|null
  login:(s:AuthSession)=>void
  logout:()=>void               // 清空会话与敏感缓存

  // 设备
  dataSource:IDataSource; connectionStatus:ConnectionStatus; devices:DeviceInfo[]

  // 算法
  riskEngine:IRiskEngine; riskEngineStatus:IRiskEngine['status']

  // 实时数据（环形缓冲，30 分钟 @ 20Hz）
  frameBuffer:ProcessedFrame[]; latestFrame:ProcessedFrame|null

  // 事件 / 告警 / 协作 / 记忆模式 / 医生覆盖 / 设置（沿用既有结构）
  // 开发者设置（含 Mock 开关）
  devSettings:{ useMockDataSource:boolean; useMockRiskEngine:boolean }
}
```

---

## PART 4 · 技术对接文档（交付物，须随代码产出为 `docs/INTEGRATION.md`）

这是交给**硬件团队**和**算法团队**的文档。前端实现必须与之逐字一致。

### 4.1 BLE GATT 定义（设备侧）

| 项 | 内容 |
|----|------|
| Service UUID | `0000A100-0000-1000-8000-00805F9B34FB`（示例，最终由硬件确认后回填） |
| Stream 特征（Notify） | `0000A101-…` 推送 `EHGFrame` 二进制帧 |
| Control 特征（Write） | `0000A102-…` 接收 `DeviceControlCommand` |
| DeviceInfo 特征（Read） | `0000A103-…` 设备序列号/固件/型号 |

### 4.2 数据帧二进制布局（小端，与 §3.2 字段对应）

```
offset 0  : u8   schemaVersion
offset 1  : u32  seq
offset 5  : u64  timestamp (ms)
offset 13 : u8   sampleRateHz
offset 14 : i16×4 ehg[ch1..ch4]  (μV ×100 定点)
offset 22 : i16  maternalHR
offset 24 : i16  fetalHR  (0x7FFF = null)
offset 26 : u8   fetalMovement (0/1/255=null)
offset 27 : i16×6 imu(ax..gz, 定点)
offset 39 : u8×4 electrodeQuality
offset 43 : u8   batteryLevel
offset 44 : u8   posture(枚举)
```

> 帧长固定，CRC 校验放尾部；丢包用 `seq` 检测并在 UI 标注数据缺口。最终字节布局以硬件确认为准，本表是前端解析器的依据。

### 4.3 算法服务契约（算法侧，与 §3.5 对应）

- **WebSocket** `wss://<algo-host>/v1/stream`：客户端按固定节奏发送 `RiskEngineRequest`（JSON），服务端推送 `RiskEngineResponse`。
- **REST** `POST /v1/evaluate`：请求体 `RiskEngineRequest`，响应 `RiskEngineResponse`。用于回放/报告离线评估。
- **鉴权**：`Authorization: Bearer <token>`，token 来自登录会话或独立算法网关密钥。
- **超时/降级**：单次评估 > 3s 视为 timeout；连续失败进入 `unavailable`，前端展示"等待算法服务"。
- **版本**：`schemaVersion` 双向校验，不匹配返回 `bad_request`。

### 4.4 错误码、重连、时间同步

- BLE 断链：指数退避重连（1s,2s,4s,…,上限 30s），UI 显示重连态。
- 设备 RTC 与本机时钟偏移：连接时做一次校时，记录 offset，所有展示用校正后时间。
- 所有错误统一 `{code,message,recoverable}`，可恢复错误自动重试，不可恢复错误提示用户。

---

## PART 5 · 应用入口、身份与登录（重写，修复真实交互逻辑）

### 5.1 身份绑定原则（关键修正）

**一个账户对应且仅对应一个角色。** 角色由后端 `AuthSession.role` 决定，**不是登录时随意挑选**。

- 登录成功后，App 只渲染该角色对应的 portal（孕妇端 / 家属端 / 医生端三选一）。
- **会话期间角色固定不可切换。** 想换角色 = 退出登录 → 用另一账户登录。
- **移除生产界面上的自由 PortalSwitcher**（旧版那种顶栏三态切换是 demo 产物，属于逻辑错误，删除）。
- 仅在**开发者设置**里提供"切换演示账户"，且需开发模式开启、有醒目标识。

### 5.2 登录流程（真实，可降级）

```
┌──────────────────────────────────────────────┐
│              知微 · ZhīWēi                     │
│         见微知著，守护早产高危妈妈              │
│                                                │
│   手机号 [____________]                        │
│   验证码 [______] [获取验证码]                  │
│   （或）账号 [______] 密码 [______]            │
│                                                │
│            [ 登 录 ]                            │
│                                                │
│   登录后将以您账户绑定的身份进入。              │
└──────────────────────────────────────────────┘
```

- 真实实现：调用后端鉴权接口，拿到 `AuthSession`（含 `role`）与对应档案。
- **角色不在登录页选择**，由账户决定（演示账户也是后端返回角色，前端不挑）。
- 后端未就绪时：登录走开发者设置里配置的"本地演示账户"，但这属于开发模式，须有开发标识；不得把"挑角色进入"当成生产登录。
- 记住登录、自动续期、token 过期跳回登录，均需真实处理。

### 5.3 全局布局（按角色单一渲染）

```
App
├── LoginScreen                         （未登录）
└── AppShell（已登录，角色固定）
    ├── TitleBar（40px，frameless 可拖拽）
    │   ├── Logo "知微"
    │   ├── 当前身份 + 姓名（只读，不可切换；旁边是"退出登录"）
    │   ├── ConnectionBadge（真实设备状态 + 电量 + 电极质量，由 status 驱动）
    │   ├── RiskEngineBadge（算法服务状态：就绪/连接中/未接入）
    │   └── WindowControls
    ├── Sidebar（按当前角色显示该角色导航；不出现其它角色的页面）
    └── ContentArea（<CurrentPage/>）
```

主题：孕妇端 `data-theme="warm"`，家属端/医生端 `data-theme="pro"`，由**登录角色**决定，不由切换器决定。

---

## PART 6 · 孕妇端（Patient Portal）

> 核心原则：默认极简，分层可深入；重要的东西大而少，次要的小而多。所有数据真实来源，禁止硬编码。

三栏布局：左导航 200px（可折叠 64px）｜中央主内容｜右辅助栏 320px（可折叠）。暖光主题。

导航：首页 · 实时监测 · 宫缩记录 · 胎动 · 产检日历 · 健康课堂 · 设置。

**每个数据页面必须实现五种状态**：加载中 / 正常 / 空数据 / 设备未连接 / 算法未接入。

### 6.1 首页（HomeStatus）

- 问候 + **由 `dueDate` 实时计算**的孕周与距预产期天数（不硬编码）。
- 中央状态圆（直径 280px）：颜色与呼吸周期由 `latestFrame.riskLevel` 驱动；**无实时数据时显示"未在监测"而非默认色**；emergency 时整页交给 EmergencyOverlay。
- "开始监测"按钮：**必须先有已连接设备**才可开始；未连接则引导去连接。今日监测时长真实累计。
- 三卡片（今日宫缩 / 今日胎动 / 本周趋势）：数值来自真实事件库；无数据显示"暂无记录"。
- "专业模式"展开：24h/7d 早产概率、宫缩频率、传播速度、中值频率、模型版本——**全部来自算法响应**；算法未接入时整块显示"等待算法服务接入"。
- 右辅助栏：设备真实状态（电量/电极）、今日真实时间线。

### 6.2 实时监测页（LiveMonitor）

- 顶部 tab：柔和模式 / 专业模式（默认柔和）。
- **柔和模式**：呼吸状态圆 + 电极贴合度 + 设备电量（真实值），暂停/结束监测。
- **专业模式**：四导联 EHG 实时波形（Canvas 60fps，真实帧流）、母体/胎心率、24h 风险。胎心无信号时按 PART 15.1.3 的克制方式处理，**不弹"胎心消失"**。
- "结束监测"防误触：时长不足建议值时确认对话框。
- 监测会话状态机：未连接→连接中→采集中→暂停→结束，时长真实累计，不允许"假装在监测"。

### 6.3 宫缩记录页（ContractionLog）

双栏：自实现日历（格内圆点数=当日宫缩次数，`⊙`=当日有 alert 级事件，数据来自真实事件库）｜选中日时间轴详情（可展开每次宫缩详情；"这次不准"触发 FalsePositiveFeedback）。允许手动补录。

### 6.4 胎动计数页（FetalMovementCounter）

大圆按钮（直径 220px）"感受到了"，空格键快捷记录；设备 IMU+EHG 自动计数与手动合并去重（去重逻辑真实实现）。趋势来自真实记录。

### 6.5 产检日历页（PrenatalCalendar）

产检计划来自档案/后端。产检前 12 小时自动生成"自上次产检以来的数据摘要"，可一键打包 PDF（真实导出）。

### 6.6 健康课堂页（HealthClass）

按孕周提供权威医学知识。禁止：母婴用品推荐、KOL 内容、付费咨询导流。

### 6.7 设置页（孕妇端）

个人信息 / 紧急联系人（含在岗轮值）/ 设备（蓝牙配对·电极更换提醒）/ 通知偏好 / 数据（导出·分享给医生·算法反馈记录）/ 关于·隐私 / **关于结束这段孕程**（记忆模式入口，PART 15）/ **退出登录**。

---

## PART 7 · 家属端（Guardian Portal）—— 多家属协作

> 核心：避免"信息黑洞"和"重复响应"。所有页面围绕"协作"。家属看到的是**自己绑定的那位孕妇**的数据（权限边界真实）。

三栏：左导航｜中央主内容｜右"家庭团队实时状态"栏（常显，显示谁在岗、谁在哪、在线状态——均为真实状态/最近活跃时间）。

- **状态页（AtAGlance）**：孕妇当前状态（来自实时流）、过去 6 小时统计（真实）、当前姿态/位置/电量、给孕妇打电话/发消息。**不显示 EHG 原始波形**（除非该家属有 `viewWaveform` 权限）。
- **协作页（CoordinationView）**：无警报时显示今日在岗安排 + 团队成员（含通知策略/权限标签）；警报时显示团队响应状态 + 我的响应（我来处理 / 我在赶过去 / 我去不了），并对其他家属呈现差异化视角（已有人响应时的版本）。
- **升级机制**（写入 `AlertCoordinationState.escalationStatus`，时间轴可视化）：

```
T+0    attention 触发 → 通知 receivesAttention 的家属
T+3min 无人响应 → 升级全体家属
T+5min 仍无人响应 → 通知主治医生
T+10min 仍无响应且已升 alert → 自动呼叫 120
emergency：T+0 通知全体+医生+120 待命；T+15s 全员倒计时呼叫 120
```

- **历史页（AlertHistory）**：过去 30 天告警，时间/级别/最终结论/响应记录/是否就医/医生备注。目的是复盘不是追责。
- **团队管理页（TeamManagement）**：家属增删改查 + 通知策略 + 权限 + 第一通知人（唯一）。emergency 通知不可关闭。
- **设置页**：个人通知偏好、设备绑定、与孕妇关系、**紧急援助（代为操作记忆模式，PART 15.2.3）**、退出登录。

---

## PART 8 · 医生端（Doctor Portal）—— 算法可解释性深度实现

> 核心：医生不盲信 AI。每个风险评分可解释、可质疑、可覆盖。医生看到的是**自己名下的患者**（权限真实）。

导航：患者 · 热图 · 波形 · 报告 · 算法（反馈+模型版本）· 设置。不需右辅助栏。

- **患者列表（PatientList）**：来自后端的患者队列，列：姓名/孕周/高危因素/最近宫缩/7d 早产风险/状态/操作。按风险排序；等级 chip 筛选；顶部"今日紧急队列"（过去 24h 触发 alert+）。分类 tab：在监测 / 已结束 / 静默中（PART 15.6.3）。风险分旁 `ⓘ`：hover 简版解释，click 完整可解释性面板。
- **宫缩热力图（ContractionHeatmapPage，D3）**：横轴 0–23h，纵轴最近 28 天，色阶按宫缩次数+强度加权；alert 格右上角小三角；hover tooltip / click 跳波形回放。底部"系统识别出的模式"分析条，旁 `ⓘ` 触发可解释性面板。
- **EHG 波形回放页（WaveformReview）**：顶部时间轴导航（缩放 24h/4h/30min/3min，滚轮缩放拖拽平移）；主视图 Canvas 渲染四导联+宫缩包络+胎心/母心+风险评分曲线；注解层（算法识别宫缩=红、伪迹=黄虚线、孕妇标记=绿、医生覆盖=紫）；右键菜单（标记伪迹/确认宫缩/改起止/加备注/不同意算法触发 Override/导出 .edf）；右侧 240px 特征参数 + 7 天风险曲线。
- **可解释性面板（ExplainabilityPanel）**——必须可在 **5 个入口**触发（患者列表评分 / 热图结论 / 波形评分曲线 / 警报详情 / 报告生成器）。右侧抽屉 480px（可全屏）。六段：总览（评分+CI+模型信息）/ 特征贡献（SHAP 水平条，红推高绿降低，top10，D3）/ 反事实分析（可干预 vs 不可改变 + 临床建议）/ 类比患者 / 不确定性与盲区（OOD + 已知盲区 + 该患者是否落入盲区）/ **医生覆盖入口**（同意 / 不同意→Override 流程）。
- **Override 流程**：算法评分 vs 医生临床评分；临床依据必填≥20 字；覆盖原因多选；提示"将影响后续显示评分 / 进入算法反馈队列 / 记入诊疗日志"。提交后真实进入 AlgorithmFeedback 队列。
- **报告生成器（ReportGenerator）**：左配置（患者/周期/章节含"算法决策摘要含覆盖记录"/医生备注）右 A4 实时预览；导出真实 PDF。
- **算法反馈管理（AlgorithmFeedback）**：tab（用户反馈 / 医生覆盖），可逐条/批量审核，决定是否回流算法团队再训练。
- **模型版本管理（ModelVersionManagement）**：当前模型、历史版本 AUC 对比、override 率预警（如"本院 override 率 12% 高于行业 5%，建议本地化微调"）。

---

## PART 9 · 全局组件

- **CountdownCallButton**：3 秒倒计时 + 巨大取消（屏宽 50%+）+ 小"立即拨打"；倒计时结束真实发起（演示走 Toast）。禁止滑动确认。
- **EmergencyOverlay**：`riskLevel==='emergency'` 触发。整页渐入暖珊瑚（禁止 #FF0000）+ 边缘 vignette 呼吸 + 中央风险简述 + 倒计时呼叫 120。分级唤醒 T+0 视觉/T+5s 渐强音/T+10s 全频/T+15s 自动拨 120（之后不可取消但显示"已通知 120 和家属"）。
- **FalsePositiveFeedback**：事后弹窗（不打断当前任务），不强制；反馈进医生端队列。
- **Toast**：右上角队列≤3，info/attention/alert/success。
- **MemorialModeBanner**：`此账户处于静默模式 · [更改]`，`color:var(--text-muted)`，无背景无图标无动画。
- **CollaborationToast**（家属端）：团队协作信息。
- **ExplanationTrigger**（医生端）：风险数字旁 `ⓘ`，统一触发 ExplainabilityPanel。
- **DevModeBanner**：当任一 Mock 开关开启时，全局常驻显眼条 `⚠ 开发模式 · 当前使用模拟数据/模拟算法，禁止用于临床`。

---

## PART 10 · 动画与微交互

```
页面切换 slide+fade；状态圆颜色 1200ms；呼吸 safe=4s/attention=3s/alert=2s；
风险数字 spring；警报覆盖 出现 opacity0+scale1.05→1（500ms）/消失 300ms；
Toast spring；侧栏折叠 250ms；按钮按下 scale0.97（150ms）；卡片悬停 border+elevation；
EHG 波形 rAF 60fps Canvas；SHAP 条 0→目标宽 stagger50ms。

—— 严禁 —— 突然大弹窗 / 抖动闪烁频闪 / 闪光粒子 / >800ms 转场 / 拟人化动画 / 警报屏幕震动
```

---

## PART 11 · 项目文件结构

```
zhiwei/
├── docs/INTEGRATION.md            # 技术对接文档（PART 4，交付物）
├── electron/{main.ts,preload.ts,ble/nobleBridge.ts}   # 真实 BLE 桥
├── src/
│   ├── types/{signal,events,user,collaboration,explainability,memorial}.ts
│   ├── data/
│   │   ├── IDataSource.ts  IRiskEngine.ts
│   │   ├── sources/{BLEDataSource,SerialDataSource,WebSocketDataSource,MockDataSource}.ts
│   │   ├── engines/{RemoteRiskEngine,MockRiskEngine}.ts
│   │   ├── SignalProcessor.ts     # 仅显示用滤波/伪迹/跌倒检测
│   │   └── frameCodec.ts          # 二进制帧解析（与 docs/INTEGRATION.md 一致）
│   ├── store/{index,device,risk,alerts,collaboration,memorial,patientJournal,settings}.ts
│   ├── components/{layout,charts,shared}/...
│   ├── portals/{patient,guardian,doctor}/...
│   ├── pages/LoginScreen.tsx
│   ├── App.tsx  main.tsx  index.css  themes.css
└── ...
```

---

## PART 12 · 真实交互逻辑正确性清单（新增 · 验收必查）

旧版有大量"toy 逻辑错误"。以下每条都必须满足；逐条自查：

```
□ 身份绑定：角色由账户决定；会话期间不可切换；换角色须退出登录。生产界面无 PortalSwitcher。
□ 连接真实性：连接徽章/监测态严格映射 ConnectionStatus；无设备显示"未发现设备"，禁止默认"已连接"。
□ 开始监测前置：未连接设备不能开始监测；不存在"假装在监测"。
□ 风险来源真实：风险分/概率/解释均来自 IRiskEngine 响应；未接入显示"等待算法服务"，不编造分数；告警不基于假分数触发。
□ 数据来源真实：孕周/预产期/姓名/高危因素/主治医生来自档案；孕周由 dueDate 与真实当前时间计算；组件内零硬编码业务假值。
□ 时间真实：所有时间用真实系统时间或数据时间戳；禁止硬编码日期（如 2025-11-14）。
□ 五态齐全：每个数据视图实现 加载/正常/空/未连接/算法未接入 五态。
□ 权限边界：家属仅见绑定患者；医生仅见名下患者；无权限数据不展示（如无 viewWaveform 不显示波形）。
□ 退出登录：清空 session、profile 与敏感缓存，断开设备/算法订阅。
□ 会话状态机：监测时长真实累计；暂停/结束真实生效。
□ 告警可溯源：告警记录真实触发时间与条件，来自真实风险流。
□ Mock 隔离：Mock 数据源/算法仅在开发者设置开启，开启时全局 DevModeBanner；生产构建可经环境变量排除 Mock 代码。
□ 数值校验：心率/孕周/电量等有范围与单位校验，异常值不直接渲染为正常。
□ 丢包/缺口：按 seq 检测丢帧，波形与统计如实标注数据缺口，不静默插值冒充连续。
□ 情感语言审查：默认不出现"宝宝/小天使/小生命/妈咪/准妈妈"等称谓（全代码扫描）。
```

---

## PART 13 · 开发期 Mock（降级到设置，受控）

- Mock 仅经**设置 → 开发者**开启：`useMockDataSource` / `useMockRiskEngine`。
- 开启任一时，全局常驻 `DevModeBanner`，并在标题栏标注开发模式。
- Mock 数据源仍实现 8 个开发场景作为**测试夹具**（不是演示卖点）：normal / braxton / preterm / emergency / electrode_loose / fall / multi_alert / doctor_override；以及 PART 15.10 的 4 个不良结局场景。这些用于本端独立联调与回归测试。
- 生产构建：通过 `import.meta.env.PROD` 或专用 flag 不打包 Mock 模块；默认数据源=BLE，默认算法=Remote。

---

## PART 14 · 交付与验收（生产级标准）

1. `npm install && npm run dev` 直接启动；有真实设备时能真正 BLE 扫描/连接/收帧。
2. `docs/INTEGRATION.md` 完整：BLE GATT/二进制帧/算法 REST+WS 契约/鉴权/错误码/重连/校时——硬件与算法团队照此即可实现接入，无需改前端业务代码。
3. `IDataSource` 与 `IRiskEngine` 契约清晰，真实实现（BLE/Remote）与 Mock 实现可热切换且仅靠设置切换。
4. PART 12 清单逐条满足（重点：身份绑定、连接真实、风险真实、数据真实、五态、权限）。
5. D3 图真正可交互（EHG 波形、热力图、SHAP、反事实）。
6. 三端各自独立完整；登录角色绑定，无自由切换。
7. 可解释性面板 5 入口可触发；医生覆盖流可走完并进反馈队列。
8. 家属协作流真实可交互；信息隔离协议（PART 15.6.2）生效。
9. 记忆模式可完整演示（PART 15），倒计时呼叫范式严格遵守。
10. TypeScript 严格，零 any / 零 @ts-ignore；ESLint 零警告；`vite build` 通过。
11. 复杂逻辑（帧解析、显示用滤波、跌倒检测、丢包检测、协作升级、记忆模式不变量）有充分注释。
12. 不使用任何 UI 组件库（MUI/AntD/Chakra），全部 Tailwind + CSS 从零实现。

README 须说明：如何配置真实设备与算法端、如何在开发者设置启用 Mock、如何演示协作流/医生覆盖流/记忆模式。

---

## PART 15 · 不良妊娠结局处理框架（伦理底线，与主规格冲突时以本部分为准）

> 本产品目标人群中经历不良妊娠结局的比例显著高于普通人群（双胎、宫颈机能不全、试管、早产史）。这不是边缘场景，是必须正面处理的核心场景。本部分的服务对象是**正在或刚刚经历人生最痛苦时刻的用户**，目标只有一个：**在最坏的事情发生时，App 做到无声、无害、不在场也不缺席。**

### 15.0 五条不可妥协原则

1. **不假装理解**：不写"我们理解您的痛苦/感同身受/宝宝去了更好的地方"。克制的沉默比拙劣的安慰更接近尊重。
2. **用户主权**：进入/退出记忆模式、删除数据全由用户决定。系统不主动建议、不催促、不"为您好"。用户的沉默是回答。
3. **默认沉默**：进入记忆模式后，所有非用户主动触发的通信全部关闭（推送/邮件/短信/Banner/Toast/节日问候/忌日提醒/再孕引导）。
4. **不强迫归因**：不强迫用户给一个"原因/标签"。除非法定保留义务，用户有权只说"请关闭一切"。
5. **撤回权**：任何进入记忆模式的操作可撤回，至少 7 天冷静期；删除即时生效但提供 30 天恢复窗口。

### 15.0.1 措辞总原则与敏感文案配置

所有敏感文案以配置文件存储（`src/i18n/sensitive-copy.ts`），前端不直接编辑。写作准则：陈述事实不评价；第二人称克制；不预设情绪；提供选项不给建议；不用感叹号；不用 emoji；不用引号包装的诗意短语。沉默优先——不确定说什么时，不说；空白页是合格设计。

```typescript
export const SENSITIVE_COPY = {
  memorialMode: {
    entryTitle:'关于结束孕程',
    entrySubtitle:'我们可以把应用切换到静默模式',
    entryBody:'如果这段时间对您来说很难，我们可以停止所有提醒与提示音。您仍可在需要时手动查看数据。此操作可随时撤回。',
    entryPrimary:'进入静默模式', entrySecondary:'暂不处理',
    confirmTitle:'确认进入静默模式？',
    confirmBody:'进入后将停止推送、倒计时警报与家属通知。您可随时从设置恢复。',
    revokeTitle:'撤回静默模式', revokeBody:'撤回后将恢复常规提醒与监测提示。',
    deleteTitle:'删除所有本地数据', deleteBody:'删除后无法在本设备恢复。医院端依法保留的数据不在此范围。'
  }
} as const
```

### 15.1 结局类型与差异化处理

```typescript
export type AdverseOutcomeType =
  | 'early_miscarriage' | 'late_miscarriage' | 'iufd' | 'medical_termination'
  | 'selective_reduction' | 'neonatal_death' | 'unknown' | 'user_choice_other'

export interface MemorialModeState {
  enabled:boolean; outcomeType:AdverseOutcomeType|null
  activatedAt:number|null; activatedBy:'patient'|'guardian'|'doctor'|'system_auto'|null
  userNote:string|null; dataRetention:DataRetentionPolicy
  canUndoUntil:number|null; allowFutureReuse:boolean|null
}
```

差异化默认（用户均可覆盖）：法定保留期 early 5y / late 10y / iufd 10y / medical_termination 30y / selective_reduction 30y / neonatal_death 10y。`selective_reduction`（减胎）特殊：仍在继续妊娠 → **部分记忆模式**：监测/警报继续运行（保护剩余胎儿），但情感化语言全关、孕周改中性显示、胎心展示隐藏、不显示"距预产期"。

### 15.1.3 持续妊娠中的危机检测（关键难点）

**胎心信号持续消失**：绝对禁止弹"未检测到胎心，请立即就医"、禁止含"胎心/心跳/宝宝"字眼、禁止突发音/突变色/震动。正确做法——顶部极轻横条（非弹窗）：`设备未检测到稳定信号。请确认电极位置，或联系您的医生。[我已知晓][联系医生]`。用"未检测到稳定信号"代替"胎心消失"，优先归因设备，提供"联系医生"而非"立即就医"，降低后台报警频率（最多 1 次/小时），**医生端同步收到通知由医生主动联系，不让 App 单独承担告知责任**。急性信号（大出血/胎膜早破）同理：宁可医生临床确认后告知，也不让 App 弹窗告知。

**异常停用**（被动触发通道）：0–7 天无动作；8–14 天用户再打开时中性问候、不显示孕周、可关闭小提示；15–30 天仍无主动推送，仅可跳过引导；>30 天发一封中性邮件（仅一次，永不重复）。**永远不是 push，永远是用户自己回来时才触发。**

### 15.2 进入记忆模式的五个通道

- **A 孕妇主动（设置页）**：入口写"关于结束这段孕程 →"（非陈述句）。说明页提供三个并列平等选项：`暂停一切提醒，保留数据` / `导出数据后注销` / `我还没准备好做选择`；末尾"您愿意告诉我们发生了什么吗？（完全自愿，可跳过）"。
- **B 异常行为被动触发**：见 15.1.3，永不 push。
- **C 家属代操作**：家属端设置→紧急援助→代为操作记忆模式。无需解释、无需分类、无需二次验证（已绑定身份，紧急时多一步都是阻碍）。操作后立即停推送/关警报/隐藏孕周，并**自动通知主治医生由医生择时联系**。孕妇打开 App 看到："陈X 在 14:23 暂停了知微的所有提醒。○继续保持暂停 ○我想自己决定。无论选择什么，都不会有人收到通知。"
- **D 医生代操作（最权威）**：医生在 EMR 录入结局后弹窗，含 **60 秒撤销窗口**（防误录入）；勾选项默认不含"自动安排随访"（医疗决策须医生主动）；执行后患者端立刻切静默视觉，不会先看到"今日活跃"再看到"已转静默"。
- **E 人工客服（兜底）**：页脚极轻链接"需要帮助？联系我们 →"。客服经敏感场景培训，可代执行记忆模式操作（验证身份后），禁止主动提及"宝宝/流产/失去"。

### 15.3 灾难性时刻的紧急中止

记忆模式启用时，所有进行中的警报必须**立即且不可逆**中止：清空 activeAlert、关闭 EmergencyOverlay、取消所有倒计时呼叫、通知已接收警报的家属"警报已结束"（**不写明原因**，原因由家属面对面沟通）、记审计日志（但不可恢复警报）。设备摘下处理改变：记忆模式下完全静默，7 天后才建议取消配对，30 天后静默取消并发一次中性邮件。

### 15.4 进入静默模式后的完整行为

视觉：`[data-memorial="true"]` 状态色饱和度降 30%、行高加大、去除横幅徽章装饰。文案替换表（上午好→您好；孕周/距预产期/今日宫缩胎动/设备连接状态→完全不显示；警报历史→历史记录；紧急联系人→联系人）。首页几乎是空的，仅一句中性问候 + 一行说明。历史数据默认隐藏，须主动进入并二次确认，视图也用静默视觉。通知规则：除账户安全通知和用户主动发起后的客服回复外，全部关闭。Banner：`此账户处于静默模式 · [更改]`，text-muted、无背景无图标无动画。

### 15.5 数据时间胶囊

软删除（暂停保留数据：本地加密保留）vs 硬删除（导出后注销：立即软删除，30 天后硬删除，期间重新登录自动恢复）。法定保留冲突时完全透明告知用户"哪些会删、哪些依法保留多少年"，不用温情话术包装法律义务。数据访问权传承（第一通知人/主治医生/法定继承人）均需明确法律授权，App 默认不主动激活。

### 15.6 三端协同协议

触发源与同步：patient/guardian/doctor 均 immediate；system_auto 延迟 24h 可撤销。**信息隔离原则（最关键）**：通知内容必须分角色定制，避免某角色在错误时机得知错误信息。异地（>100km）+ 非第一联系人家属默认**不主动通知**（收到的是"过去 24 小时无新事件"等中性内容），真相由在场家属面对面告知。医生端归档分类新增：在监测 / 已结束 / **静默中**（进入记忆模式但未录结局，医生需主动评估随访）。

### 15.8 再次妊娠

系统不主动检测。设置提供"我有了新的开始"：`全新开始`（干净新孕程，旧数据保留但不参与）/ `参考之前的数据`（个性化预测，医生可见完整历史）/ `我还在考虑`。"全新开始"实现：UI 如首次注册，但警报灵敏度悄悄默认调高一档且**不告知**（避免成为对过去的提醒）；医生端**会**收到完整既往（医疗必要），但医生须遵守：不主动提及既往除非患者主动提起。

### 15.10 不良结局测试场景（开发夹具，非演示卖点）

`scenario_loss_early_user_initiated`（用户主动进入记忆模式全流程）/ `scenario_iufd_doctor_initiated`（医生 EMR 录入 IUFD 后三端同步，验证 60s 撤销与信息隔离：在场丈夫收到"警报已结束"、异地妈妈不收到任何通知）/ `scenario_family_initiated_silence`（家属代操作）/ `scenario_subsequent_pregnancy`（从静默模式开新孕程，患者端无任何既往引用 vs 医生端可见完整历史）。

### 15.13 不变量（验收前须证明，每条至少 1 个单元测试并作 CI 门禁）

```
1. 静默模式下，triggerAlert(*) === no-op（警报系统不可被任何触发器激活）
2. 静默模式下，sendPushNotification(*) === no-op（账户安全通知除外）
3. 静默模式下，渲染 DOM 文本不含黑名单词汇
   BLACKLIST = ['宝宝','宝贝','小生命','小天使','准妈妈','妈咪','失去','离开','逝去',
                '更好的地方','坚强','勇敢','加油','下一个会更好','再生一个','感同身受',
                '我们陪您','节哀','保重']
4. 医生触发的 60s 倒计时可在 [0,60s] 内中止
5. 硬删除 + 30 天后，本 App 数据库无该用户任何记录（医院端法定备份除外）
6. 信息隔离：距离 >100km 且非第一联系人的家属，记忆模式变更对其 notify === no-op
   （例外：第一联系人主动"通知所有人"）
```

---

> **本部分是知微的伦理底线。** 工程师若认为某条"过于严格、影响体验"，请记住：本部分的服务对象不需要"良好的用户体验"，她们需要一个**不再打扰她们的 App**。
>
> 开始编码前，先产出 `docs/INTEGRATION.md`（PART 4），再按文件结构逐文件实现，每个文件完整、真实、可对接，不留 toy 占位。
