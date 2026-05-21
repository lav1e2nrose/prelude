你是一名顶级全栈工程师，同时具备医疗级软件的 UI/UX 设计审美和母婴医疗领域的人文敏感度。

你现在要从零构建一个名为 \*\*"知微"\*\* 的 PC 桌面应用程序（Electron），用于向投资人和三甲医院产科展示一套完整的早产风险监测系统。



这不是网页，不是 demo，不是大学作业。

这是一款面向\*\*早产高危孕妇 + 家属 + 产科医生\*\*的\*\*医疗级子宫肌电监测与早产预警平台\*\*，代码质量和视觉标准对标 $100,000 级别的医疗 SaaS 产品。



> \*\*见微知著\*\* —— 通过便携式子宫肌电（EHG）监测装置，在临床症状出现前数小时识别早产先兆，给高危孕妇、家属、医生三个角色提供差异化的信息呈现。



\---



\## PART 0 · 项目背景与设计哲学（必读，影响所有页面决策）



\### 0.1 真实用户画像



\*\*孕妇端用户\*\*：孕 28-37 周，被诊断为早产高危（高龄/试管/双胎/宫颈机能不全/有早产史/保胎中）。她们的状态特征：



\- 可能长期卧床，PC 端使用场景是床头桌或膝上电脑

\- 焦虑水平显著高于普通孕妇

\- 相当一部分是高知/高龄/医疗信息敏感人群——\*\*她们想懂自己的数据，不愿被当病人哄\*\*

\- 视觉疲劳明显，对突发刺激敏感



\*\*家属端用户\*\*：丈夫为主，但\*\*真实场景中常有多人协作\*\*——丈夫上班 + 妈妈/婆婆陪护 + 月嫂介入 + 异地父母关注。需求是分工协调，避免"信息黑洞"（妈妈不知道丈夫已处理）或"重复响应"（所有人同时赶往）。



\*\*医生端用户\*\*：三甲医院产科医生 / 产科 ICU 医生。需求是临床决策依据。\*\*医生不会盲信 AI 预测\*\*，需要算法给出"为什么是这个评分"的解释，且能在不同意时优雅地覆盖。



\### 0.2 设计哲学（九条原则，每条都在后续规格里有对应实现）



1\. \*\*分层信息架构（Progressive Disclosure）\*\*：默认极简，但每一层都可展开到更专业的深度。\*\*不假设用户看不懂复杂信息\*\*。

2\. \*\*医疗器械的温度版\*\*：克制的深色专业感 + 暖色调点缀，不做"少女母婴 App"。

3\. \*\*倒计时取消范式\*\*：所有紧急动作（呼叫家属、呼叫 120、报警）走"3 秒倒计时自动执行 + 巨大取消按钮"，而非"滑动确认"。

4\. \*\*分级唤醒\*\*：警报先视觉变化 → 渐强提示音 → 全屏覆盖，禁止突发刺激。

5\. \*\*情感语言克制\*\*：默认说"你的身体状态"，不说"宝宝"。所有拟人化视觉（光圈、波纹）不被赋予"宝宝"人格。

6\. \*\*假阳性的优雅处理\*\*：用户可标记"这次预警不准"，进入算法反馈队列；连续误报触发主动道歉 + 灵敏度调整建议。

7\. \*\*记忆模式（Memorial Mode）\*\*：必须有"标记本次孕程结束 / 进入静默 / 删除所有情感化提醒"入口。这是母婴医疗产品的伦理底线。

8\. \*\*三端数据流必须自洽\*\*：孕妇端产生的每一条数据，都要明确它会以什么形式呈现给家属和医生。

9\. \*\*AI 透明化\*\*：医生端任何风险评分都必须可解释、可质疑、可覆盖。不允许"黑箱预测"。



\---



\## PART 1 · 技术栈（不可妥协）



```

桌面框架:     Electron 28+（frameless window，自定义标题栏）

前端框架:     React 18 + TypeScript（严格模式，零 any）

构建工具:     Vite 5

样式方案:     Tailwind CSS（仅核心工具类）+ CSS Variables + CSS Modules（复杂组件）

动画:         Framer Motion（页面切换、状态变化、弹窗）

图表:         D3.js（热力图、波形图、SHAP 可视化）+ Recharts（统计图表）

状态管理:     Zustand（全局状态 + 数据流）

日历:         自实现日历组件（不用第三方）

串口/BLE:     Electron IPC → Node.js serialport / noble（仅接口，不强制运行）

本地存储:     electron-store（事件日志、用户配置持久化）

图标库:       Lucide React

字体:         Google Fonts CDN（Inter / DM Sans / Source Han Sans）

PDF 导出:    puppeteer-core（主进程）

```



\---



\## PART 2 · 设计系统



\### 2.1 双主题色彩系统（医生端/家属端深色 + 孕妇端暖光，同一 App 内并存）



```css

/\* === 通用语义色 === \*/

:root {

&#x20; /\* 状态色（克制版，避免警报性饱和度） \*/

&#x20; --safe:        #5B8C5A;   /\* 鼠尾草绿 \*/

&#x20; --safe-glow:   rgba(91, 140, 90, 0.25);

&#x20; --attention:   #C99846;   /\* 暖琥珀 \*/

&#x20; --attention-glow: rgba(201, 152, 70, 0.25);

&#x20; --alert:       #C85C50;   /\* 暖珊瑚红 \*/

&#x20; --alert-glow:  rgba(200, 92, 80, 0.30);

&#x20; --critical:    #B23A48;   /\* 仅用于救命级警报 \*/



&#x20; /\* 信号通道色 \*/

&#x20; --ehg-ch1: #D4A574;

&#x20; --ehg-ch2: #C29076;

&#x20; --ehg-ch3: #A87968;

&#x20; --ehg-ch4: #8E665A;

&#x20; --fhr-color: #6B9080;

&#x20; --mhr-color: #A4727B;



&#x20; /\* SHAP / 可解释性专用色 \*/

&#x20; --shap-positive: #C85C50;   /\* 正向贡献（提升风险） \*/

&#x20; --shap-negative: #6B9080;   /\* 负向贡献（降低风险） \*/

&#x20; --shap-neutral:  #8B8580;



&#x20; /\* 品牌 \*/

&#x20; --accent: #6B7E8C;

&#x20; --accent-dim: rgba(107, 126, 140, 0.15);

}



/\* === 医生端 + 家属端深色主题 === \*/

\[data-theme="pro"] {

&#x20; --bg-0: #0F1114;

&#x20; --bg-1: #16191D;

&#x20; --bg-2: #1D2126;

&#x20; --bg-3: #252A30;



&#x20; --border-subtle: #252A30;

&#x20; --border-default: #353B42;

&#x20; --border-emphasis: #4A5158;



&#x20; --text-primary: #E8E6E1;

&#x20; --text-secondary: #9A958D;

&#x20; --text-muted: #5C5852;



&#x20; --heat-0: #1D2126;

&#x20; --heat-1: #3A2A1F;

&#x20; --heat-2: #6B4530;

&#x20; --heat-3: #9B6440;

&#x20; --heat-4: #D08850;

}



/\* === 孕妇端暖光主题 === \*/

\[data-theme="warm"] {

&#x20; --bg-0: #F5F1EA;

&#x20; --bg-1: #FAF7F1;

&#x20; --bg-2: #FFFFFF;

&#x20; --bg-3: #EFEAE0;



&#x20; --border-subtle: #E8E0D2;

&#x20; --border-default: #D6CCB8;

&#x20; --border-emphasis: #B8AC95;



&#x20; --text-primary: #2C2A26;

&#x20; --text-secondary: #6B665E;

&#x20; --text-muted: #A39B8E;



&#x20; --safe:      #6FA56E;

&#x20; --attention: #D9A455;

&#x20; --alert:     #D26B5F;

}

```



\### 2.2 字体系统



```css

\--font-display: 'DM Sans', 'Source Han Sans SC', sans-serif;

\--font-body:    'Inter', 'Source Han Sans SC', sans-serif;

\--font-mono:    'JetBrains Mono', monospace;



/\* 孕妇端字号比医生端大一档（视觉疲劳考虑，非"老年友好"） \*/

\[data-theme="warm"] {

&#x20; --text-base: 16px;

&#x20; --text-lg:   19px;

&#x20; --text-xl:   24px;

&#x20; --text-2xl:  32px;

&#x20; --text-3xl:  44px;

&#x20; --line-height-base: 1.65;

}



\[data-theme="pro"] {

&#x20; --text-base: 14px;

&#x20; --text-lg:   16px;

&#x20; --text-xl:   20px;

&#x20; --text-2xl:  28px;

&#x20; --text-3xl:  36px;

&#x20; --line-height-base: 1.5;

}

```



\### 2.3 组件规范



\- `border-radius`：医生端 6px / 暖光端 14px（更柔和但不卡通）

\- `box-shadow`：医生端 `0 1px 3px rgba(0,0,0,0.4)` / 暖光端 `0 2px 12px rgba(120,100,70,0.08)`

\- 所有可交互元素：`transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1)`

\- 按钮按下：`transform: scale(0.97)`

\- \*\*孕妇端主要按钮：最小高度 52px，padding x 24px\*\*（不是 36px）

\- 医生端密度更高：最小按钮高度 32px



\---



\## PART 3 · 数据架构（核心，必须严格实现）



\### 3.1 数据帧标准结构



```typescript

// src/types/signal.ts



export interface EHGFrame {

&#x20; timestamp: number              // Unix ms

&#x20; ehg: number\[]                  // 4 通道 EHG 原始 μV 值

&#x20; fetalHR?: number               // 胎心率 bpm

&#x20; maternalHR: number             // 母体心率 bpm

&#x20; fetalMovement?: 0 | 1

&#x20; imu: {

&#x20;   ax: number; ay: number; az: number

&#x20;   gx: number; gy: number; gz: number

&#x20; }

&#x20; electrodeQuality: number       // 0-100

&#x20; batteryLevel: number           // 0-100

&#x20; posture: 'standing' | 'sitting' | 'lying\_left' | 'lying\_right' | 'lying\_back' | 'unknown'

}



export interface ProcessedFrame extends EHGFrame {

&#x20; contractionState: ContractionState

&#x20; contractionIntensity: number

&#x20; pretermRiskScore: number

&#x20; pretermRiskExplanation: RiskExplanation   // 关键：每帧都带可解释性数据

&#x20; riskLevel: RiskLevel

&#x20; artifacts: ArtifactType\[]

&#x20; features: EHGFeatures

}



// 可解释性数据结构（关键新增）

export interface RiskExplanation {

&#x20; modelVersion: string                       // 'EHG-Net-v2.3.1'

&#x20; confidence: number                         // 0-1，模型自身置信度

&#x20; confidenceInterval: \[number, number]       // 95% CI，如 \[65, 89]

&#x20; featureContributions: FeatureContribution\[] // SHAP-style 特征贡献

&#x20; oodScore: number                           // 0-1，分布外检测分数（越高越异常）

&#x20; similarPatients: SimilarPatient\[]          // 数据库中最相似的历史患者

&#x20; counterfactuals: Counterfactual\[]          // 反事实分析

&#x20; knownLimitations: string\[]                 // 已知盲区警示

}



export interface FeatureContribution {

&#x20; featureName: string                        // 'contractionsPerHour' | 'medianFrequency' | 'peakFrequency' | 'rmsAmplitude'
&#x20;                                         // | 'contractionRegularity' | 'contractionPropagationVelocity' | 'bandpowerLow' | 'bandpowerHigh'
&#x20;                                         // | 'pretermProbability24h' | 'pretermProbability7d' | 'gestationalWeek' | 'cervicalLength'
&#x20;                                         // | 'fetalMovementCount6h' | 'maternalHeartRate' | 'previousPretermHistory' | 'multiplePregnancy' | 'ivfPregnancy'

&#x20; displayName: string                        // '宫缩频率' | '中值频率'

&#x20; currentValue: number

&#x20; baselineValue: number                      // 训练集中位数

&#x20; contribution: number                       // -1 到 +1，正值=推高风险

&#x20; unit: string                               // '次/h' | 'Hz'

}



export interface SimilarPatient {

&#x20; anonymizedId: string

&#x20; similarityScore: number                    // 0-1

&#x20; gestationalWeekAtMeasurement: number

&#x20; actualOutcome: 'term\_delivery' | 'preterm\_24h' | 'preterm\_7d' | 'preterm\_28d' | 'unknown'

&#x20; outcomeNote?: string

}



export interface Counterfactual {

&#x20; scenario: string                           // '如果宫缩频率降至 2 次/h'

&#x20; conditionChanges: Record<string, number>

&#x20; resultingRiskScore: number

&#x20; resultingRiskChange: number                // 与当前的 delta

&#x20; actionability: 'modifiable' | 'fixed'      // 是否可干预

}



export type ContractionState = 'rest' | 'active' | 'peak' | 'recovery'

export type RiskLevel = 'safe' | 'attention' | 'alert' | 'emergency'

export type ArtifactType = 'movement' | 'electrode\_loose' | 'power\_line' | 'maternal\_breathing'



export interface EHGFeatures {

&#x20; bandpower: { low: number; high: number }

&#x20; medianFrequency: number

&#x20; peakFrequency: number

&#x20; rmsAmplitude: number

&#x20; contractionsPerHour: number

&#x20; contractionRegularity: number

&#x20; contractionPropagationVelocity: number

&#x20; pretermProbability24h: number

&#x20; pretermProbability7d: number

}



export interface ContractionEvent {

&#x20; id: string

&#x20; startTime: number

&#x20; endTime: number

&#x20; peakTime: number

&#x20; peakIntensity: number

&#x20; durationSec: number

&#x20; source: 'algorithm' | 'manual'

&#x20; userValidation?: 'confirmed' | 'false\_positive' | 'unsure'

&#x20; doctorOverride?: DoctorOverride            // 医生覆盖记录

}



export interface DoctorOverride {

&#x20; doctorId: string

&#x20; overrideAction: 'confirm\_algorithm' | 'reject\_algorithm' | 'modify\_boundaries'

&#x20; clinicalReasoning: string                  // 必填，至少 20 字

&#x20; timestamp: number

}



export interface FetalMovementEvent {

&#x20; id: string

&#x20; timestamp: number

&#x20; source: 'algorithm' | 'manual'

&#x20; cluster?: string

}

```



\### 3.2 家属协作数据结构（新增）



```typescript

// src/types/collaboration.ts



export interface GuardianMember {

&#x20; id: string

&#x20; name: string

&#x20; relationship: 'spouse' | 'parent' | 'parent\_in\_law' | 'sibling' | 'caregiver' | 'other'

&#x20; phoneNumber: string

&#x20; avatar?: string



&#x20; // 通知策略

&#x20; notificationConfig: {

&#x20;   receivesAttention: boolean

&#x20;   receivesAlert: boolean

&#x20;   receivesEmergency: boolean              // 此项不允许关闭（紧急默认全员通知）

&#x20;   quietHours?: { start: string; end: string }

&#x20;   quietHoursOverrideForEmergency: boolean // 紧急级是否打破静默时段

&#x20; }



&#x20; // 权限

&#x20; permissions: {

&#x20;   viewWaveform: boolean                   // 是否能看到 EHG 原始波形

&#x20;   viewLocation: boolean                   // 是否能看到孕妇位置

&#x20;   viewHistoricalData: boolean

&#x20;   receiveDailySummary: boolean

&#x20; }



&#x20; // 当前状态

&#x20; currentStatus: {

&#x20;   isOnline: boolean

&#x20;   lastActiveAt: number

&#x20;   location?: { lat: number; lng: number; updatedAt: number }

&#x20;   distanceToPatient?: number              // 米

&#x20; }



&#x20; isPrimaryContact: boolean                 // 第一通知人，每个孕妇必须有且仅有一个

}



// 在岗轮值表

export interface OnCallSchedule {

&#x20; patientId: string

&#x20; shifts: OnCallShift\[]

}



export interface OnCallShift {

&#x20; guardianId: string

&#x20; startTime: string                         // 'HH:MM' 例如 '08:00'

&#x20; endTime: string                           // 'HH:MM' 例如 '20:00'

&#x20; daysOfWeek: number\[]                      // 0-6, 0=周日

}



// 警报响应记录

export interface AlertResponse {

&#x20; alertId: string

&#x20; guardianId: string

&#x20; responseType: 'acknowledged' | 'en\_route' | 'arrived' | 'cannot\_respond' | 'delegated'

&#x20; message?: string                          // 可选附言

&#x20; timestamp: number

&#x20; estimatedArrivalMinutes?: number

}



// 警报协调状态（实时计算）

export interface AlertCoordinationState {

&#x20; alertId: string

&#x20; notifiedGuardians: string\[]

&#x20; acknowledgedGuardians: string\[]

&#x20; enRouteGuardians: string\[]

&#x20; cannotRespondGuardians: string\[]

&#x20; primaryResponder: string | null           // 第一个 acknowledge 的人

&#x20; escalationStatus: 'normal' | 'escalated\_to\_all' | 'escalated\_to\_doctor' | 'escalated\_to\_120'

&#x20; escalationTimeline: EscalationEvent\[]

}

```



\### 3.3 数据源统一接口（策略模式）



```typescript

// src/data/IDataSource.ts



export type ConnectionStatus =

&#x20; | 'disconnected' | 'pairing' | 'connected'

&#x20; | 'reconnecting' | 'error' | 'mock'



export interface IDataSource {

&#x20; readonly name: string

&#x20; readonly status: ConnectionStatus



&#x20; connect(config?: Record<string, unknown>): Promise<void>

&#x20; disconnect(): Promise<void>

&#x20; onFrame(callback: (frame: EHGFrame) => void): () => void

&#x20; onStatusChange(callback: (status: ConnectionStatus) => void): () => void

&#x20; onError(callback: (error: Error) => void): () => void

&#x20; onBatteryLow(callback: (level: number) => void): () => void

&#x20; onElectrodeLoose(callback: (channel: number) => void): () => void

}

```



\### 3.4 数据源实现（Mock 为默认）



```typescript

// MockAdapter 必须实现的场景：

// 1. scenario\_normal           - 平静日常

// 2. scenario\_braxton          - 频繁假性宫缩

// 3. scenario\_preterm          - 早产前驱（逐步升级）

// 4. scenario\_emergency        - 突发紧急

// 5. scenario\_electrode\_loose  - 电极脱落

// 6. scenario\_fall             - 跌倒

// 7. scenario\_multi\_alert      - 触发多家属协作流（新增）

// 8. scenario\_doctor\_override  - 触发医生覆盖算法流（新增）



// BLEAdapter + WebSocketAdapter：骨架代码完整

```



\### 3.5 信号处理管道



```typescript

class SignalProcessor {

&#x20; bandpassFilter(signal: number\[], lowHz: number, highHz: number, sampleRate: number): number\[]

&#x20; notchFilter(signal: number\[], freqHz: 50 | 60, sampleRate: number): number\[]

&#x20; detectArtifacts(frame: EHGFrame, history: EHGFrame\[]): ArtifactType\[]

&#x20; detectFall(imuHistory: EHGFrame\['imu']\[]): boolean

&#x20; extractContraction(window: EHGFrame\[]): ContractionEvent | null

&#x20; computePretermRiskScore(

&#x20;   features: EHGFeatures\[],

&#x20;   gestationalWeek: number,

&#x20;   riskFactors: RiskFactor\[]

&#x20; ): { score: number; explanation: RiskExplanation }    // 必须同时返回解释

}

```



\### 3.6 Zustand 全局状态



```typescript

interface AppStore {

&#x20; // 数据源

&#x20; dataSource: IDataSource

&#x20; connectionStatus: ConnectionStatus

&#x20; setDataSource: (source: IDataSource) => void



&#x20; // 实时数据（环形缓冲区，30 分钟 @ 20Hz）

&#x20; frameBuffer: ProcessedFrame\[]

&#x20; latestFrame: ProcessedFrame | null

&#x20; pushFrame: (frame: ProcessedFrame) => void



&#x20; // 风险状态

&#x20; riskLevel: RiskLevel

&#x20; pretermRiskScore: number

&#x20; currentExplanation: RiskExplanation | null



&#x20; // 事件

&#x20; contractions: ContractionEvent\[]

&#x20; fetalMovements: FetalMovementEvent\[]

&#x20; addContraction: (e: ContractionEvent) => void

&#x20; validateContraction: (id: string, validation: ContractionEvent\['userValidation']) => void



&#x20; // 警报系统

&#x20; activeAlert: Alert | null

&#x20; alertHistory: Alert\[]

&#x20; triggerAlert: (alert: Alert) => void

&#x20; dismissAlert: (reason: 'user\_cancel' | 'user\_confirm' | 'auto\_resolved') => void



&#x20; // 家属协作（新增）

&#x20; guardians: GuardianMember\[]

&#x20; onCallSchedule: OnCallSchedule

&#x20; alertCoordination: AlertCoordinationState | null

&#x20; respondToAlert: (response: AlertResponse) => void

&#x20; delegateAlert: (fromGuardianId: string, toGuardianId: string) => void



&#x20; // 用户与角色

&#x20; currentUser: User | null

&#x20; currentPortal: Portal

&#x20; login: (user: User) => void

&#x20; switchPortal: (portal: Portal) => void



&#x20; // 孕妇信息

&#x20; patient: PatientProfile



&#x20; // 记忆模式

&#x20; memorialMode: { enabled: boolean; reason?: string; activatedAt?: number }

&#x20; enterMemorialMode: (reason: string) => void



&#x20; // 医生端

&#x20; patients: PatientSummary\[]

&#x20; selectedPatientId: string | null

&#x20; doctorOverrides: DoctorOverride\[]

&#x20; recordDoctorOverride: (override: DoctorOverride) => void



&#x20; // 设置

&#x20; settings: AppSettings

&#x20; updateSettings: (patch: Partial<AppSettings>) => void

}

```



\---



\## PART 4 · 应用入口与全局布局



\### 4.1 Electron 主进程



```typescript

const win = new BrowserWindow({

&#x20; width: 1440,

&#x20; height: 900,

&#x20; minWidth: 1280,

&#x20; minHeight: 800,

&#x20; frame: false,

&#x20; titleBarStyle: 'hidden',

&#x20; backgroundColor: '#0F1114',

&#x20; webPreferences: {

&#x20;   preload: path.join(\_\_dirname, 'preload.js'),

&#x20;   contextIsolation: true,

&#x20;   nodeIntegration: false,

&#x20; }

})



// IPC：窗口控制 / BLE 操作 / 串口操作 / PDF 报告导出 / 紧急通知模拟

```



\### 4.2 全局布局组件



```

App

├── LoginScreen

└── AppShell

&#x20;   ├── TitleBar               （40px，frameless 可拖拽）

&#x20;   │   ├── Logo "知微"

&#x20;   │   ├── PortalSwitcher     （孕妇端 · 家属端 · 医生端 三态切换）

&#x20;   │   ├── ConnectionBadge    （设备状态 + 电量 + 电极质量）

&#x20;   │   ├── LiveIndicator

&#x20;   │   └── WindowControls

&#x20;   ├── Sidebar                （200px，可折叠 64px；不同 Portal 显示不同导航）

&#x20;   └── ContentArea            （Framer Motion AnimatePresence）

&#x20;       └── <CurrentPage />

```



\*\*主题切换\*\*：进入孕妇端时 `document.documentElement.dataset.theme = 'warm'`，进入家属端/医生端时切回 `'pro'`。整个窗口色彩跟随变化，给演示者直观的"切换感"。



\### 4.3 PortalSwitcher 设计



三个 pill 形 tab：

\- `\[👩 孕妇端]` `\[👨 家属端]` `\[⚕ 医生端]`

\- 当前激活态：底部 2px 横条 + 文字加重

\- Framer Motion `layoutId` 实现底部条平滑滑动

\- 切换时整个 ContentArea 做 fade + slight slide 转场



\---



\## PART 5 · 登录界面



全屏深色背景，中央三个角色卡片横向排列：



```

┌──────────────────────────────────────────────────┐

│                  知微 · ZhīWēi                    │

│             见微知著，守护早产高危妈妈              │

│                                                  │

│   ┌──────────┐   ┌──────────┐   ┌──────────┐    │

│   │    👩     │   │    👨     │   │    ⚕      │    │

│   │  孕妇端   │   │  家属端   │   │  医生端   │    │

│   │  Mama    │   │  Family   │   │  Doctor  │    │

│   │  小雅     │   │  陈X (丈夫)│   │  王X (主任) │   │

│   └──────────┘   └──────────┘   └──────────┘    │

│                                                  │

│            \[选择身份进入演示]                       │

│                                                  │

│  当前 Mock 场景： \[scenario\_normal ▼]              │

└──────────────────────────────────────────────────┘

```



\- 三个角色 mock 登录，点击直接进入

\- 进入后主题色自动切换（孕妇端 warm，家属/医生端 pro）

\- 顶部 PortalSwitcher 始终可见

\- 登录页底部直接暴露 Mock 场景选择器，演示时方便切换



\---



\## PART 6 · 孕妇端（Patient Portal）—— PC 桌面界面



> \*\*核心原则\*\*：默认极简，分层可深入。PC 端宽屏允许同屏展示更多信息，但仍要遵循"重要的东西大而少 + 次要的东西小而多"的视觉层次。



\### 6.1 整体布局



孕妇端使用三栏布局（不是单栏滚动）：



```

┌──────┬────────────────────────────────┬──────────────┐

│      │                                │              │

│ 侧边 │       主内容区                  │  辅助信息栏  │

│ 导航 │       (主视觉区)                │  (可折叠)    │

│      │                                │              │

│ Home │                                │              │

│ 监测 │                                │              │

│ 宫缩 │                                │              │

│ 胎动 │                                │              │

│ 日历 │                                │              │

│ 课堂 │                                │              │

│ 设置 │                                │              │

│      │                                │              │

└──────┴────────────────────────────────┴──────────────┘

```



\- 左侧导航 200px（可折叠至 64px 只显示图标）

\- 中央主内容区自适应

\- 右侧辅助信息栏 320px（可折叠隐藏），显示当前设备状态、今日统计、最近事件

\- 整体配色暖光主题



\### 6.2 首页（HomeStatus）



\*\*主内容区布局\*\*：



```

┌──────────────────────────────────────────────────────┐

│                                                      │

│  上午好，小雅                                          │

│  孕 32 周 + 3 天 · 距离预产期还有 7 周 + 4 天          │

│                                                      │

│                                                      │

│                      ◯                                │

│                                                      │

│                    平稳                               │

│         过去 4 小时未检测到规律宫缩                     │

│                                                      │

│                                                      │

│              \[ ▶  开始监测 ]                          │

│                                                      │

│       今天已监测 2h 18m  /  建议 4h                   │

│                                                      │

└──────────────────────────────────────────────────────┘



┌─────────────────┬─────────────────┬─────────────────┐

│  今日宫缩         │  今日胎动         │  本周趋势         │

│  3 次            │  47 次          │  ↘ 风险评分下降    │

│  全部为假性       │  ▲ 较昨日 +12   │  详情 →           │

└─────────────────┴─────────────────┴─────────────────┘



┌──────────────────────────────────────────────────────┐

│ ⚙ 专业模式（点击展开）                                  │

└──────────────────────────────────────────────────────┘

```



\*\*展开"专业模式"后\*\*：



```

┌──────────────────────────────────────────────────────┐

│  当前 24h 早产概率   2.1%  ▼ 0.4%                     │

│  当前 7d  早产概率   5.8%  ▼ 0.6%                     │

│                                                      │

│  宫缩频率              1.4 次/h                       │

│  收缩传播速度           2.1 cm/s                      │

│  中值频率              0.38 Hz                       │

│                                                      │

│  模型版本：EHG-Net v2.3.1  ·  置信区间 95%             │

│                                                      │

│  \[📤 打包发给主治医生]                                 │

└──────────────────────────────────────────────────────┘

```



\*\*状态圆视觉\*\*：

\- 直径 280px（PC 大屏可以做大）

\- 三态颜色与呼吸周期同前文规范

\- emergency 状态：圆消失，整页被 EmergencyOverlay 接管



\*\*右侧辅助栏（首页默认显示）\*\*：



```

设备

&#x20; ●  已连接

&#x20; 电量  74%  ▮▮▮▮▱

&#x20; 电极  92%  ●●●● 



今日时间线

&#x20; 09:23  开始监测

&#x20; 10:45  胎动 +1

&#x20; 11:12  假性宫缩

&#x20; 11:30  结束监测

&#x20; 14:05  开始监测

&#x20; 15:40  胎动 +1

&#x20; 16:12  记录症状：腹部紧绷

&#x20; 18:05  假性宫缩

&#x20; 20:10  结束监测

```



\### 6.3 实时监测页（LiveMonitor）



\*\*双视图切换\*\*：顶部有 tab `\[ 柔和模式 | 专业模式 ]`，默认柔和。



\*\*柔和模式\*\*：



```

┌──────────────────────────────────────────────────────┐

│                  监测中  ●  00:23:47                  │

│                                                      │

│                                                      │

│                                                      │

│                       ╭─────╮                         │

│                     ╱         ╲                       │

│                   │   平静中    │                     │

│                     ╲         ╱                       │

│                       ╰─────╯                         │

│                                                      │

│                                                      │

│   电极贴合度 ●●●● 92%        设备电量 ▮▮▮▮▱ 74%        │

│                                                      │

│                                                      │

│              \[ 暂停 ]    \[ 结束监测 ]                  │

└──────────────────────────────────────────────────────┘

```



\*\*专业模式\*\*：



```

┌──────────────────────────────────────────────────────┐

│              监测中  ●  00:23:47                      │

│                                                      │

│  EHG 实时波形（最近 60 秒）                            │

│  ┌────────────────────────────────────────────────┐ │

│  │ Ch1 ─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─    │ │

│  │ Ch2 ─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─    │ │

│  │ Ch3 ─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─    │ │

│  │ Ch4 ─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─╱╲─    │ │

│  └────────────────────────────────────────────────┘ │

│                                                      │

│  ┌─────────────────┬────────────────────────────────┐│

│  │ 母体心率 78 bpm  │ 胎心率 142 bpm                  ││

│  └─────────────────┴────────────────────────────────┘│

│                                                      │

│  这些数据会同步给您的主治医生 王X                       │

└──────────────────────────────────────────────────────┘

```



\*\*"结束监测"按钮防误触\*\*：点击后弹出确认对话框：`本次监测仅 23 分钟，建议至少 40 分钟。确定结束吗？\[ 结束 ] \[ 继续监测 ]`



\### 6.4 宫缩记录页（ContractionLog）



\*\*双栏布局\*\*：



```

┌──────────────────────────┬──────────────────────────┐

│  日历视图                  │   选中日的时间轴详情      │

│                          │                          │

│  < 11 月          >       │   2025-11-14            │

│  一 二 三 四 五 六 日       │                          │

│   ·  · ··  · ·· ·  ·     │   00:00 ─                │

│   · ·· ⊙  · ··  · ··    │   06:00 ─                │

│   ●                      │   10:23  ▌ 假性 12s      │

│                          │   12:45  ▌ 假性  8s      │

│  ●  今日                  │   15:11  ⊙ 有效 45s      │

│  ·  正常                  │           \[这次不准]      │

│  ⊙  关注                  │   18:00 ─                │

│                          │   20:32  ▌ 关注 20s      │

│                          │   22:18  ▌ 假性 10s      │

└──────────────────────────┴──────────────────────────┘

```



\- 日历格内小圆点数量 = 当日宫缩次数；`⊙` = 当日有 alert 级事件

\- 右侧时间轴每个宫缩可点击展开 → 详情面板（强度、持续时间、是否算法识别、用户反馈）

\- "这次不准"按钮触发 `FalsePositiveFeedback` 流



\### 6.5 胎动计数页（FetalMovementCounter）



```

┌──────────────────────────────────────────────────────┐

│                                                      │

│                   今天的胎动                           │

│                                                      │

│                       47                              │

│                                                      │

│                  已记录 6 小时                         │

│                                                      │

│         ┌────────────────────────────┐               │

│         │                            │               │

│         │      （ 大圆按钮 ）          │               │

│         │       感受到了              │               │

│         │                            │               │

│         └────────────────────────────┘               │

│                                                      │

│       最近一次 3 分钟前  ·  本小时 8 次                  │

│                                                      │

│  ⓘ 设备也在自动计数（用 IMU+EHG），与你的记录合并去重    │

│                                                      │

└──────────────────────────────────────────────────────┘

```



\- 圆按钮直径 220px，点击轻微视觉反馈 + 数字递增微动画

\- 键盘快捷键：空格键 = "感受到了"（卧床时不用动鼠标）



\### 6.6 产检日历页（PrenatalCalendar）



显示产检计划。产检前 12 小时自动生成"自上次产检以来的数据摘要"，可一键打包 PDF。



\### 6.7 健康课堂页（HealthClass）



按孕周提供阶段性医学知识（三甲医院产科或权威医学组织来源）。

\*\*禁止\*\*：母婴用品推荐、KOL 内容、付费咨询导流。



\### 6.8 设置页（孕妇端）



```

个人信息       预产期 / 高危因素 / 主治医生

紧急联系人     家属列表（同时展示在岗轮值）

设备           蓝牙配对 / 电极更换提醒

通知偏好       预警灵敏度 / 静默时段 / 提醒方式

数据           导出全部数据 / 分享给医生 / 算法反馈记录

──────────────────────────────────────────

关于"知微"

隐私与数据安全

──────────────────────────────────────────

孕程结束 / 静默模式  →

```



\*\*记忆模式入口设计\*\*：点击后进入说明页（同前文规范）。



\---



\## PART 7 · 家属端（Guardian Portal）—— 多家属协作架构



> \*\*本端核心难点\*\*：避免"信息黑洞"（妈妈不知道丈夫已处理）和"重复响应"（所有人同时赶往）。本端的所有页面都围绕"协作"而非"个人查看"。



\### 7.1 整体布局



```

┌──────┬──────────────────────────────────┬──────────┐

│      │                                  │          │

│ 侧边 │       主内容区                    │ 家庭团队  │

│ 导航 │                                  │ 实时状态  │

│      │                                  │          │

│ 状态 │                                  │ 陈X (我)  │

│ 协作 │                                  │ ● 在家    │

│ 历史 │                                  │          │

│ 团队 │                                  │ 妈妈     │

│ 日历 │                                  │ ● 在医院  │

│ 设置 │                                  │ 8km away │

│      │                                  │          │

│      │                                  │ 王医生   │

│      │                                  │ ● 在线    │

└──────┴──────────────────────────────────┴──────────┘

```



右侧"家庭团队"栏默认常显，让家属随时知道"现在谁在岗、谁在哪里"。



\### 7.2 状态页（AtAGlance）



```

┌──────────────────────────────────────────────────────┐

│  小雅                                                  │

│  孕 32 周 + 3 天                                       │

│                                                      │

│              ●                                        │

│            平稳                                       │

│       上次更新 2 分钟前                                │

│                                                      │

│  过去 6 小时                                           │

│    宫缩  2 次（均为假性）                              │

│    胎动  38 次                                        │

│    监测时长  3h 12m                                   │

│                                                      │

│  现在                                                  │

│    姿态   左侧卧                                       │

│    位置   家中                                         │

│    电量   74%                                         │

│                                                      │

│  ┌────────────────┐  ┌────────────────┐              │

│  │ 📞 给小雅打电话  │  │ 💬 发消息       │              │

│  └────────────────┘  └────────────────┘              │

└──────────────────────────────────────────────────────┘

```



家属端\*\*不显示具体 EHG 波形\*\*——家属看不懂，也不应让家属代替医生判断。但权限里可开启"完整查看"，此时增加一个 tab 让有医学背景的家属查看波形。



\### 7.3 协作页（CoordinationView）—— 核心新增页



\*\*没有警报时\*\*：



```

┌──────────────────────────────────────────────────────┐

│  今天的在岗安排                                         │

│                                                      │

│  08:00 ─ 18:00    陈X (丈夫)        \[我]              │

│  18:00 ─ 23:00    王X (婆婆)                          │

│  23:00 ─ 08:00    陈X (丈夫)        \[我]              │

│                                                      │

│  \[ 调整本周值班 ]   \[ 临时请假 ]                       │

│                                                      │

│  ─────────────────────────────                       │

│                                                      │

│  团队成员（5 人）                                       │

│                                                      │

│  陈X    丈夫     第一通知人  · 全部通知 · 看波形         │

│  王X    婆婆     在岗中     · 全部通知                  │

│  刘X    妈妈     紧急通知   · 异地（上海）              │

│  李护士  月嫂     仅紧急     · 日间在场                  │

│  陈父   公公     仅每日摘要                            │

│                                                      │

│  \[ + 邀请家庭成员 ]    \[ 调整通知策略 ]                  │

└──────────────────────────────────────────────────────┘

```



\*\*警报触发时（attention/alert）\*\*：



```

┌──────────────────────────────────────────────────────┐

│  ⚠  小雅在 14:23 触发预警                              │

│  类型：频繁宫缩（过去 30 分钟 4 次）                    │

│  级别：留意                                            │

│                                                      │

│  ─── 团队响应状态 ───                                 │

│                                                      │

│  陈X (你)    ⏳ 等待响应                                │

│  王X (婆婆)  ⏳ 等待响应                                │

│                                                      │

│  ┌─────────────────────────────────────┐             │

│  │  请选择您的响应                       │             │

│  │                                     │             │

│  │  \[ 我来处理 ]                        │             │

│  │  \[ 我正在赶过去 ]    预计 \_\_\_分钟到    │             │

│  │  \[ 我现在去不了 ]                    │             │

│  └─────────────────────────────────────┘             │

│                                                      │

│  其他人可见：未响应                                     │

└──────────────────────────────────────────────────────┘

```



\*\*当一个家属响应"我来处理"后，其他家属看到的版本\*\*：



```

┌──────────────────────────────────────────────────────┐

│  ⚠  小雅在 14:23 触发预警  （已有人响应）              │

│  类型：频繁宫缩                                        │

│                                                      │

│  ─── 团队响应状态 ───                                 │

│                                                      │

│  陈X (丈夫)   ✓ 已确认处理   14:25                    │

│              "我在客厅，过去看一下"                    │

│                                                      │

│  你           ⏳ 待响应                                │

│                                                      │

│  ┌─────────────────────────────────────┐             │

│  │  陈X 正在处理。您可以：                │             │

│  │                                     │             │

│  │  \[ 我也过去支援 ]                    │             │

│  │  \[ 我先关注情况 ]                    │             │

│  │  \[ 我无法到达 ]                      │             │

│  └─────────────────────────────────────┘             │

│                                                      │

│  💬 \[快速发消息给陈X]                                  │

└──────────────────────────────────────────────────────┘

```



\### 7.4 升级机制（Escalation）



定义在 `AlertCoordinationState.escalationStatus` 中：



```

T+0     attention 级警报触发 → 通知 receivesAttention=true 的家属

T+3min  无人响应 → 升级到所有家属（含原本只接收 alert+ 的）

T+5min  仍无人响应 → 通知主治医生

T+10min 仍无人响应且警报已升级到 alert → 自动呼叫 120



emergency 级警报：

T+0     立即通知所有家属 + 主治医生 + 120 准备

T+15s   全员自动启动倒计时呼叫 120（同前规范）

```



升级过程在 CoordinationView 顶部以时间轴可视化：



```

14:23  ─── 警报触发

14:24  ─── 通知陈X, 王婆婆

14:26  ─── ⚠ 升级：通知所有家属

14:28  ─── ⚠ 升级：通知主治医生

14:29  ─── ✓ 陈X 已响应"我去处理"

14:35  ─── ✓ 陈X 已到达

14:48  ─── 警报解除（医生远程确认假性宫缩）

```



\### 7.5 历史页（AlertHistory）



按时间倒序列出过去 30 天所有警报，每条显示：

\- 时间、级别、最终结论（真实/假阳性/不确定）

\- 响应记录（谁先响应、谁到场、用时多久）

\- 是否就医、医生备注



\*\*目的不是追责，是事后复盘\*\*："上次半夜婆婆响应慢了，下次可以调整轮值"。



\### 7.6 团队管理页（TeamManagement）



完整的家属增删改查 + 权限管理：



```

邀请新成员：发送链接（mock）

角色：丈夫 / 母亲 / 父亲 / 公婆 / 兄弟姐妹 / 月嫂 / 其他



通知策略：

&#x20; ☑ attention 级（留意）

&#x20; ☑ alert 级（需要关注）

&#x20; ☑ emergency 级（紧急）  \[此项不可关闭]

&#x20; 静默时段：\[22:00] \~ \[07:00]   ☑ emergency 打破静默



权限：

&#x20; ☑ 查看 EHG 原始波形（需医学背景）

&#x20; ☑ 查看孕妇位置

&#x20; ☑ 查看历史数据

&#x20; ☑ 每日摘要通知



身份：

&#x20; ○ 第一通知人（每个孕妇只能有一个）

&#x20; ● 普通家属

```



\### 7.7 设置页（家属端）



个人通知偏好、设备绑定、与孕妇的关系。



\---



\## PART 8 · 医生端（Doctor Portal）—— 算法可解释性深度实现



> \*\*本端核心\*\*：医生不会盲信 AI。每个风险评分都必须可解释、可质疑、可覆盖。



\### 8.1 整体布局



```

┌──────┬────────────────────────────────────────────┐

│      │                                            │

│ 侧边 │       主内容区                              │

│ 导航 │                                            │

│      │                                            │

│ 患者 │                                            │

│ 热图 │                                            │

│ 波形 │                                            │

│ 报告 │                                            │

│ 算法 │  ← 算法反馈管理 + 模型版本                    │

│ 设置 │                                            │

│      │                                            │

└──────┴────────────────────────────────────────────┘

```



医生端不需要右侧辅助栏，因为医生需要的是完整宽度展示数据。



\### 8.2 患者列表（PatientList）



```

姓名     孕周    高危因素              最近宫缩   早产风险(7d)  状态    操作

─────────────────────────────────────────────────────────────────────────

张小雅   32+3   高龄/试管              1 次/h    5.8%        🟡留意   \[查看]

李慧    29+5   双胎/宫颈机能不全      3 次/h    18.3%       🔴警示   \[查看]

王X     34+1   早产史                 0          1.2%        🟢平稳   \[查看]

周敏    30+2   宫颈机能不全           2 次/h    9.6%        🟡留意   \[查看]

赵X    27+6   双胎/高龄              4 次/h    24.1%       🔴警示   \[查看]

钱蕾    36+0   试管/高龄              0.5 次/h  3.1%        🟢平稳   \[查看]

```



\- 按早产风险排序

\- 风险等级 chip 筛选

\- 顶部"今日紧急队列"列出过去 24h 触发 alert+ 的患者

\- 风险分数列每个数字旁有小图标 `ⓘ` —— hover 触发简版可解释性 popover；click 跳转完整可解释性页



\### 8.3 宫缩热力图（ContractionHeatmapPage）



\*\*D3.js 实现\*\*



数据结构：



```typescript

interface ContractionHeatmapCell {

&#x20; date: string

&#x20; hour: number

&#x20; contractionCount: number

&#x20; maxIntensity: number

&#x20; hasAlert: boolean

&#x20; pretermRiskAvg: number

}

```



渲染规格：

\- 横轴：0:00 \~ 23:00

\- 纵轴：最近 28 天

\- 色阶：`--heat-0` 到 `--heat-4`，基于宫缩次数 + 强度加权

\- alert 格右上角小三角

\- hover → tooltip / click → 抽屉跳转到 EHG 波形回放



\*\*底部模式分析条\*\*：



```

┌─────────────────────────────────────────────────────┐

│  系统识别出的模式                                     │

│                                                     │

│  • 夜间宫缩倾向                                       │

│    02:00–05:00 占总宫缩的 41%                         │

│    建议：评估夜间体位与床垫硬度                        │

│                                                     │

│  • 活动相关性                                          │

│    步行 > 2000 步当天，宫缩频率 +35%                  │

│    建议：单日活动量上限调整                            │

│                                                     │

│  \[ⓘ 查看这些结论是如何得出的]                          │

└─────────────────────────────────────────────────────┘

```



点击 ⓘ 触发\*\*可解释性面板\*\*（PART 8.5）。



\### 8.4 EHG 波形回放页（WaveformReview）



\*\*顶部时间轴导航\*\*：



```

\[< 前一天]  \[2025-11-14 ▼]  \[> 后一天]



全天时间轴（SVG，宽度100%）：

████░░░░████░░░░░░░░████░░░░  ← 高亮 = 有事件

&#x20;      ↑

&#x20;   拖动手柄（当前查看）  当前：03:42:15

```



\- 缩放级别：Level 0 = 24h / Level 1 = 4h / Level 2 = 30min / Level 3 = 3min

\- 鼠标滚轮缩放，拖拽平移



\*\*主视图（Canvas 渲染）\*\*：



```

┌────────────────────────────────────────────────────┐

│ Ch1 ─╱╲────╱╲╲─────╱╲─                            │

│ Ch2 ─╱╲────╱╲╲─────╱╲─                            │

│ Ch3 ─╱╲────╱╲╲─────╱╲─                            │

│ Ch4 ─╱╲────╱╲╲─────╱╲─                            │

│                                                    │

│ 宫缩包络 ──╱██████╲──────╱████╲──                  │

│                                                    │

│ 胎心率   ────────╲╱──╲─╱──   140 bpm               │

│ 母体心率 ────────╱──╲╱╲─╱──   82  bpm              │

│                                                    │

│ 风险评分 ──╱──╲──╱─────╲──   78% ⓘ                │  ← 评分曲线，ⓘ可点

└────────────────────────────────────────────────────┘

```



\*\*注解层\*\*：

\- 红色半透明矩形 = 算法识别的有效宫缩，label：`收缩传播 2.3 cm/s · 置信度 91% · ⓘ`

\- 黄色虚线矩形 = 伪迹段，label：`\[运动伪迹]` / `\[电极松动]`

\- \*\*绿色框 = 孕妇本人标记的"确认有感觉的宫缩"\*\*

\- \*\*紫色框 = 医生已覆盖（override）的事件\*\*



\*\*右键菜单\*\*：

\- 标记为伪迹（排除）

\- 确认为有效宫缩

\- 修改宫缩起止时间

\- 添加临床备注

\- \*\*不同意算法（触发 Override 流程）\*\*

\- 导出此段为 .edf 文件



\*\*右侧面板（240px）\*\*：

\- 当前时间段特征参数：bandpower / 中值频率 / RMS / 传播速度

\- 早产概率历史曲线（Recharts，过去 7 天）

\- 主观-客观一致性统计



\### 8.5 算法可解释性面板（ExplainabilityPanel）—— 核心新增



\*\*触发方式\*\*：

\- 医生端任何地方点击 `ⓘ` 图标

\- 患者列表风险评分 hover 显示简版，click 显示完整版

\- 波形回放页风险曲线点击任意点

\- 热图分析结论旁的 ⓘ



\*\*布局\*\*：右侧抽屉 480px 宽（可全屏展开）



\#### 8.5.1 总览段（Overview）



```

┌──────────────────────────────────────────────────────┐

│  ← 关闭                                  \[全屏展开 ⛶]  │

│                                                      │

│  张小雅 · 11-14 03:42 · 7 日早产风险                  │

│                                                      │

│              78%                                     │

│         置信区间 65% – 89%                            │

│         (95% Confidence Interval)                    │

│                                                      │

│  ▲ 较 24h 前 +23%                                    │

│                                                      │

│  ━━━━━━━━━━━━━━━━━━━━━━                              │

│                                                      │

│  模型版本    EHG-Net v2.3.1                          │

│  训练数据    2018-2024，n=12,847                     │

│  在类似患者上 AUC = 0.86                              │

│  最后更新    2024-09-15                              │

└──────────────────────────────────────────────────────┘

```



\#### 8.5.2 特征贡献段（Feature Contributions，SHAP 风格）



```

为什么是 78%？以下因素影响了这个评分：



宫缩频率（5.2 次/h）       ████████████ +32%

&#x20; · 当前值远高于基线 1.2 次/h



收缩传播速度（4.1 cm/s）   ████████ +18%

&#x20; · 高于早产前驱阈值 3.5 cm/s



宫颈机能不全（病史）       █████ +12%

&#x20; · 不可改变因素



孕周（29 周 +5 天）        ████ +9%

&#x20; · 早产风险窗口期



胎动正常（38 次/6h）       ███ -8%

&#x20; · 降低风险



母体心率稳定（72 bpm）     ██ -5%

&#x20; · 降低风险

```



每个特征条 hover 显示更多信息（基线分布、可干预性、相关文献参考）。



\*\*实现细节\*\*：

\- 用 D3.js 水平条形图

\- 红色条 = 推高风险（正贡献），绿色条 = 降低风险（负贡献）

\- 按绝对贡献排序，top 10



\#### 8.5.3 反事实分析段（Counterfactual Analysis）



```

如果……会怎么样？



如果宫缩频率降至 2 次/h        78% → 41%   (-37%) \[可干预]

如果宫颈长度恢复到 3 cm          78% → 28%   (-50%) \[手术可干预]

如果没有早产史                   78% → 56%   (-22%) \[不可改变]

如果孕周到 35 周                  78% → 19%   (-59%) \[需要保胎到 35 周]



═══════════════════════════════════════════

临床建议（基于以上）：

&#x20; · 优先抑制宫缩频率（药物干预）

&#x20; · 评估宫颈环扎术指征

&#x20; · 目标保胎至少到 33 周

```



医生看完这一段，能立刻看到\*\*哪些是可以行动的\*\*，哪些是不可改变的。



\#### 8.5.4 类比患者段（Similar Patients）



```

数据库中最相似的 5 名历史患者：



\#1  相似度 92%   孕 29+3 触发    →  保胎成功，38 周分娩

\#2  相似度 89%   孕 30+1 触发    →  保胎至 35+2，平安分娩

\#3  相似度 87%   孕 29+5 触发    →  早产 7 天后，32+5 分娩

\#4  相似度 85%   孕 28+6 触发    →  保胎成功，37 周分娩

\#5  相似度 83%   孕 30+2 触发    →  早产 3 天后，30+5 分娩



类似情况下：

&#x20; 足月分娩  3/5  (60%)

&#x20; 延期早产  2/5  (40%)

```



每一行可点击展开查看该患者的完整脱敏数据。



\#### 8.5.5 不确定性与盲区段（Uncertainty \& Known Limitations）



```

⚠  不确定性提示



OOD 检测分数：0.12  （低，分布内）

&#x20; · 当前数据与训练分布相符，预测可信度较高



已知盲区：

&#x20; · 模型在双胎妊娠数据上欠采样（仅 3.2%）

&#x20; · 模型未充分验证于宫颈环扎术后患者

&#x20; · 训练数据中早产 < 28 周样本较少（极早产）



该患者是否落入盲区：

&#x20; ✓ 单胎  ✓ 无环扎  ✗ 不是极早产范围



→ 预测结论可信度评估：中高

```



\#### 8.5.6 医生覆盖（Override）入口



```

─────────────────────────────────────────

您是否同意此评分？



\[ ✓ 我同意 78% 的评分 ]



\[ ✗ 我不同意，需要修正 ]   ← 触发 Override 流程

```



\*\*Override 流程弹窗\*\*：



```

┌──────────────────────────────────────────────────────┐

│  覆盖算法评分                                          │

│                                                      │

│  算法评分：78%                                         │

│  您的临床评分：\[\_\_]%                                  │

│                                                      │

│  您的临床判断依据（必填，至少 20 字）：                  │

│  ┌────────────────────────────────────────────────┐ │

│  │                                                │ │

│  │                                                │ │

│  └────────────────────────────────────────────────┘ │

│                                                      │

│  覆盖原因分类（多选）：                                │

│   ☐ 算法忽略了关键临床信息                            │

│   ☐ 算法对此类患者预测不准                            │

│   ☐ 我有额外的检查结果                                │

│   ☐ 患者主观症状与算法不符                            │

│   ☐ 其他                                              │

│                                                      │

│  此覆盖会：                                           │

│    · 影响该患者后续显示的评分                          │

│    · 进入算法反馈队列用于模型迭代                       │

│    · 记录于诊疗日志                                    │

│                                                      │

│  \[ 取消 ]                  \[ 确认覆盖 ]               │

└──────────────────────────────────────────────────────┘

```



\### 8.6 报告生成器页（ReportGenerator）



左右双栏（40% / 60%）：



\*\*左栏配置\*\*：

\- 患者选择 / 报告周期 / 章节复选框

\- 增加章节：`☐ 算法决策摘要（含医生覆盖记录）`

\- 医生备注输入框



\*\*右栏实时预览\*\*：A4 比例，深色文档样式



\*\*导出\*\*：puppeteer 渲染 PDF



\### 8.7 算法反馈管理页（AlgorithmFeedback）



```

┌────────────────────────────────────────────────────────┐

│  算法反馈队列                                            │

│                                                        │

│  ┌──────────────┬─────────────────┐                   │

│  │ 用户反馈      │ 医生覆盖          │                   │

│  └──────────────┴─────────────────┘                   │

│                                                        │

│  患者     时间        算法判断   反馈类型     处理        │

│  ────────────────────────────────────────────────────  │

│  小雅    11-12 14:23  有效宫缩   false\_pos   \[审核]    │

│  小雅    11-12 18:11  alert      false\_pos   \[审核]    │

│  李慧    11-13 03:11  emergency  override    \[审核]    │

│  王X    11-13 09:05  有效宫缩   confirm     \[已通过]  │

│  周敏   11-13 22:41  alert      false\_pos   \[退回]    │

│                                                        │

│  本周累计：                                              │

│    用户反馈   23 条                                     │

│    医生覆盖   8 条                                      │

│    通过审核   18 条 → 已发送至算法团队                   │

└────────────────────────────────────────────────────────┘

```



医生可批量审核，决定是否反馈给算法团队用于模型再训练。



\### 8.8 模型版本管理（Settings 子页）



```

当前使用模型：EHG-Net v2.3.1



历史版本对比：

&#x20; v2.3.1  当前    AUC 0.86    上线日期 2024-09-15

&#x20; v2.3.0          AUC 0.84    上线日期 2024-06-12

&#x20; v2.2.5          AUC 0.81    上线日期 2024-03-08



模型预警：

&#x20; ⓘ 检测到您过去 30 天的 override 率为 12%（行业平均 5%）

&#x20;   可能原因：本院患者人群与训练集差异较大

&#x20;   建议：联系算法团队提供本院数据用于本地化微调

```



\---



\## PART 9 · 全局组件



\### 9.1 倒计时呼叫按钮（CountdownCallButton）



任何紧急呼叫走以下模式（不允许任何"滑动确认"）：



```

点击 \[📞 呼叫主治医生] 后：



┌──────────────────────────────────────────────────────┐

│              即将拨打主治医生 王X                       │

│                                                      │

│                       03                              │

│                    秒后拨出                            │

│                                                      │

│         \[          ✕  取消          ]                │

│                                                      │

│         \[立即拨打 →]                                  │

└──────────────────────────────────────────────────────┘

```



\- 倒计时默认 3 秒

\- "取消"按钮巨大（屏宽 50%+）

\- "立即拨打"小按钮（加速）

\- 倒计时结束自动拨出（演示中走 Toast "已模拟拨出电话"）



\### 9.2 紧急覆盖层（EmergencyOverlay）



```

触发：riskLevel === 'emergency'



视觉：

&#x20; 整页背景渐入暖珊瑚（禁止 #FF0000）

&#x20; 边缘 vignette pulse（柔和呼吸）

&#x20; 中央显示风险简述 + 倒计时拨打 120 按钮



分级唤醒：

&#x20; T+0:    视觉变化

&#x20; T+5s:   渐强提示音（从 30dB 渐升）

&#x20; T+10s:  全频报警

&#x20; T+15s:  自动拨打 120

&#x20; T+15s 后不可取消，但仍显示"已通知 120 和家属"

```



\### 9.3 假阳性反馈组件（FalsePositiveFeedback）



事后弹窗（不打断当前操作，在主任务完成后显示）：



```

┌──────────────────────────────────────────────────────┐

│  关于刚才的警报                                        │

│                                                      │

│  14:23 系统提示"频繁宫缩"                              │

│  您现在感觉                                            │

│                                                      │

│  ○ 确实有不规律的紧绷感                                │

│  ○ 没什么特别感觉                                      │

│  ○ 当时在剧烈活动                                      │

│  ○ 不确定                                              │

│                                                      │

│  \[提交]  \[稍后再说]                                    │

└──────────────────────────────────────────────────────┘

```



不强制反馈。反馈数据进入医生端 AlgorithmFeedback。



\### 9.4 Toast 通知系统



右上角队列，最多 3 条。

info（暖灰）/ attention（暖琥珀）/ alert（暖珊瑚）/ success（鼠尾草绿）



\### 9.5 Mock 数据标识条



```

当 dataSource 为 Mock：顶部常驻细条

"⚠ 演示模式 · 当前显示模拟数据"

点击可切换 Mock 场景下拉菜单

```



\### 9.6 记忆模式横幅（MemorialModeBanner）



```

此账户处于静默模式 · \[更改]

```



颜色比正常 UI 浅一档，不动画。



\### 9.7 协作通知组件（CollaborationToast）—— 家属端新增



家属端独有的特殊 Toast 类型，用于团队协作信息：



```

┌────────────────────────────────────────┐

│  陈X 已确认处理 14:23 的预警            │

│  "我在客厅，过去看一下"                 │

│  \[查看详情]                            │

└────────────────────────────────────────┘

```



\### 9.8 可解释性触发器（ExplanationTrigger）—— 医生端新增



任何风险评分数字旁的 ⓘ 图标。统一组件，点击触发 ExplainabilityPanel。



\---



\## PART 10 · 动画与微交互规范



```

页面切换:           Framer Motion slide + fade

状态圆颜色变化:     CSS transition 1200ms ease

状态圆呼吸:         CSS @keyframes，safe=4s / attention=3s / alert=2s

风险分数变化:       Framer Motion animate number，stiffness=80

警报覆盖出现:       opacity(0)+scale(1.05) → opacity(1)+scale(1)，500ms ease-out

警报覆盖消失:       opacity(1) → opacity(0)，300ms ease-in

Toast 出现:         translateY(-20%)+opacity 0→1，spring

侧边栏折叠:         width 200px → 64px，250ms ease

按钮按下:           scale(0.97)，150ms

卡片悬停:           border 渐变 + elevation 上升 4px

数据刷新:           数值更新 opacity 0.7 → 1，150ms

设备连接成功:       ConnectionBadge 渐变（不脉冲）

EHG 波形:           requestAnimationFrame 60fps Canvas 滚动

SHAP 条形图:        进入时从 0 宽度 grow 到目标宽度，stagger 50ms

家属状态变化:       团队栏头像状态点颜色 transition 300ms



—— 严禁的动画 ——

✗ 突然出现的大尺寸弹窗

✗ 抖动 / 闪烁 / 频闪

✗ 闪光特效 / 粒子动画

✗ 任何超过 800ms 的转场

✗ 拟人化动画（小船摇晃、宝宝形象、动物吉祥物）

✗ 警报触发时的屏幕震动

```



\---



\## PART 11 · 项目文件结构



```

zhiwei/

├── electron/

│   ├── main.ts

│   └── preload.ts

├── src/

│   ├── types/

│   │   ├── signal.ts

│   │   ├── events.ts

│   │   ├── user.ts

│   │   ├── collaboration.ts                  # 家属协作

│   │   ├── explainability.ts                 # 可解释性

│   │   └── memorial.ts

│   ├── data/

│   │   ├── IDataSource.ts

│   │   ├── SignalProcessor.ts

│   │   ├── ExplainabilityEngine.ts           # 生成 RiskExplanation 的 mock 引擎

│   │   └── adapters/

│   │       ├── MockAdapter.ts

│   │       ├── BLEAdapter.ts

│   │       └── WebSocketAdapter.ts

│   ├── store/

│   │   ├── index.ts

│   │   ├── memorial.ts

│   │   ├── alerts.ts

│   │   └── collaboration.ts                  # 协作状态

│   ├── components/

│   │   ├── layout/

│   │   │   ├── TitleBar.tsx

│   │   │   ├── Sidebar.tsx

│   │   │   ├── PortalSwitcher.tsx

│   │   │   └── AppShell.tsx

│   │   ├── charts/

│   │   │   ├── EHGWaveformChart.tsx          # D3 实时波形

│   │   │   ├── ContractionHeatmap.tsx        # D3 热力图

│   │   │   ├── BreathingCircle.tsx

│   │   │   ├── ShapBarChart.tsx              # 可解释性 SHAP 图

│   │   │   ├── CounterfactualChart.tsx       # 反事实可视化

│   │   │   └── StatsCharts.tsx

│   │   ├── shared/

│   │   │   ├── StatusOrb.tsx

│   │   │   ├── CountdownCallButton.tsx

│   │   │   ├── EmergencyOverlay.tsx

│   │   │   ├── FalsePositiveFeedback.tsx

│   │   │   ├── MemorialModeBanner.tsx

│   │   │   ├── MockModeBanner.tsx

│   │   │   ├── AlertToast.tsx

│   │   │   ├── ExplanationTrigger.tsx        # ⓘ 图标统一组件

│   │   │   └── ExplainabilityPanel.tsx       # 可解释性主面板

│   ├── portals/

│   │   ├── patient/

│   │   │   ├── HomeStatus.tsx

│   │   │   ├── LiveMonitor.tsx

│   │   │   ├── ContractionLog.tsx

│   │   │   ├── FetalMovementCounter.tsx

│   │   │   ├── PrenatalCalendar.tsx

│   │   │   ├── HealthClass.tsx

│   │   │   └── PatientSettings.tsx

│   │   ├── guardian/

│   │   │   ├── AtAGlance.tsx

│   │   │   ├── CoordinationView.tsx          # 协作主页（新增）

│   │   │   ├── TeamManagement.tsx            # 团队管理（新增）

│   │   │   ├── AlertHistory.tsx

│   │   │   ├── EmergencyResponse.tsx

│   │   │   ├── TeamSidebar.tsx               # 右侧团队状态栏（新增）

│   │   │   ├── CollaborationToast.tsx        # 协作通知（新增）

│   │   │   └── GuardianSettings.tsx

│   │   └── doctor/

│   │       ├── PatientList.tsx

│   │       ├── ContractionHeatmapPage.tsx

│   │       ├── WaveformReview.tsx

│   │       ├── ReportGenerator.tsx

│   │       ├── AlgorithmFeedback.tsx

│   │       ├── ModelVersionManagement.tsx    # 模型版本管理（新增）

│   │       ├── OverridePanel.tsx             # 医生覆盖流程（新增）

│   │       └── DoctorSettings.tsx

│   ├── pages/

│   │   └── LoginScreen.tsx

│   ├── App.tsx

│   ├── main.tsx

│   ├── index.css

│   └── themes.css

├── package.json

├── vite.config.ts

├── tailwind.config.js

└── tsconfig.json

```



\---



\## PART 12 · Mock 数据要求



\### 12.1 患者库（医生端）



8 名虚拟患者，孕周 26-36 周分布。每人：

\- 不同的高危因素组合

\- 过去 28 天完整 Mock 历史（宫缩、胎动、风险评分、可解释性数据）

\- 至少 1 名当前 alert，1 名 emergency

\- \*\*每名患者必须有 ≥1 条 doctor override 记录\*\*，用于演示反馈流



\### 12.2 当前演示孕妇（孕妇端）



\- 默认登录："小雅"，孕 32 周 + 3 天

\- 预设过去 7 天的宫缩与胎动记录

\- 主治医生：王X

\- \*\*5 位家属\*\*：陈X（丈夫，第一通知人，在家）、王X（婆婆，在岗中，距离 2km）、刘X（妈妈，异地上海）、李护士（月嫂，日间在场）、陈父（公公，仅每日摘要）



\### 12.3 在岗轮值表（家属端）



预设小雅的家庭值班表：

\- 08:00-18:00 陈X（丈夫，上班但可远程响应）

\- 18:00-23:00 王X（婆婆，在家陪护）

\- 23:00-08:00 陈X（丈夫，夜间在身边）



\### 12.4 场景剧本（8 种）



登录页和 Settings 提供"剧本演示"开关：



1\. \*\*scenario\_normal\*\* — 平静日常

2\. \*\*scenario\_braxton\*\* — 频繁假性宫缩

3\. \*\*scenario\_preterm\*\* — 早产先兆逐步升级

4\. \*\*scenario\_emergency\*\* — 突发紧急 + EmergencyOverlay

5\. \*\*scenario\_electrode\_loose\*\* — 电极脱落降级处理

6\. \*\*scenario\_fall\*\* — 跌倒检测

7\. \*\*scenario\_multi\_alert\*\* —— 触发家属协作完整流（attention 通知陈X和婆婆 → 婆婆响应"在路上" → 陈X 收到"婆婆已响应"通知 → 升级到 alert → 通知医生 → 医生远程评估 → 解除）

8\. \*\*scenario\_doctor\_override\*\* —— 触发医生覆盖完整流（医生查看 78% 评分 → 打开可解释性面板 → 查看 SHAP 贡献 → 查看类比患者 → 不同意 → 进入 Override 流程 → 填写临床依据 → 提交 → 进入 AlgorithmFeedback 队列）



\---



\## PART 13 · 交付要求



1\. \*\*完整可运行代码\*\*，`npm install \&\& npm run dev` 后直接启动

2\. \*\*Mock 模式开箱即用\*\*

3\. \*\*D3 实现的图必须真正可交互\*\*：EHG 波形、热力图、SHAP 条形图、反事实图

4\. \*\*实时数据引擎必须工作\*\*

5\. \*\*三端切换完整\*\*

6\. \*\*8 种 Mock 场景必须完整可触发\*\*

7\. \*\*数据源接口完整实现\*\*

8\. \*\*TypeScript 严格类型\*\*，零 `any`，零 `@ts-ignore`

9\. \*\*代码注释充分\*\*，复杂算法逻辑（EHG 滤波、宫缩检测、跌倒检测、SHAP 计算）必须注释

10\. \*\*不使用任何 UI 组件库\*\*（MUI / Ant Design / Chakra），全部从零用 Tailwind + CSS 实现

11\. \*\*可解释性面板必须可在 5 个不同入口触发\*\*（患者列表评分 / 热图分析结论 / 波形评分曲线 / 警报详情 / 报告生成器）

12\. \*\*家属协作流必须真实可交互\*\*：在演示中切到家属端，能看到团队状态实时更新；切换不同家属身份能看到对应视角

13\. \*\*医生覆盖流程必须真实可走完\*\*：从评分 ⓘ 点击 → 解释面板 → 不同意 → Override 表单 → 提交 → 出现在 AlgorithmFeedback

14\. \*\*记忆模式必须能完整演示\*\*

15\. \*\*倒计时呼叫范式必须严格遵守\*\*

16\. \*\*情感语言审查\*\*：全代码搜索一遍，确保默认不出现"宝宝"、"小天使"、"小生命"、"妈咪"等称谓



\---



\## PART 14 · 设计禁区清单（每一条都因 Gemini 方案踩过坑）



✗ 任何"小船摇晃"、"光圈 = 宝宝心跳"等拟人化映射

✗ 默认色调使用粉色、薄荷绿、奶油黄等"母婴消费品色"

✗ 紧急按钮使用"滑动解锁"式确认

✗ 警报使用突发响铃、突发屏幕变色、突发震动

✗ 默认文案出现"宝宝很安全"、"宝宝今天很乖"、"准妈妈"

✗ 监测中强插入"放下手头的事，左侧卧 15 分钟"等强指令

✗ 隐藏专业数据（如波形、频率特征），只给"傻瓜结论"

✗ 首页或主流程出现积分、勋章、连续打卡、母婴用品推荐

✗ "您已连续守护宝宝 X 天"等情感化游戏化提示

✗ 记忆模式入口隐藏在 3 级菜单之后

✗ 警报触发后无任何反馈通道

✗ 孕妇端功能在家属端/医生端没有对应承接

✗ 算法风险评分以"黑箱"形式呈现，没有可解释性入口

✗ 家属警报通知是"个人事件"而非"团队协作"

✗ 医生只能"同意算法"不能"覆盖算法"



\---



> 开始编码。先输出完整 `package.json` 和 `themes.css`，然后按文件结构逐文件输出，每个文件完整，不省略。

> 实现完成后，提供一段 README，说明：

> 1. 如何切换三端

> 2. 如何触发 8 种 Mock 场景

> 3. 如何演示家属协作流（场景 7 完整步骤）

> 4. 如何演示医生覆盖流（场景 8 完整步骤）

> 5. 如何演示记忆模式

# PART 15 · 不良妊娠结局处理框架



> 本部分作为 "知微" v2 主 prompt 的附录，专门处理 \*\*妊娠不良结局 (Adverse Pregnancy Outcomes, APO)\*\* 相关的所有产品行为。

>

> 这部分的存在不是为了"功能完整性"，而是为了让产品在用户最脆弱的时刻\*\*不成为施加二次伤害的工具\*\*。



\---



\## 15.0 设计前提（必读，所有后续条款的解释基础）



\### 15.0.1 我们在做什么



绝大多数早产高危孕妇会平安生产。但本产品的目标用户群里，\*\*经历不良妊娠结局的比例显著高于普通人群\*\*：



\- 双胎妊娠的胎死宫内率约为单胎的 4 倍

\- 宫颈机能不全的中期流产率约 30%

\- 试管婴儿群体的流产率约 25-30%

\- 有早产史的再次妊娠中，约 15-30% 会再次早产



也就是说，\*\*本产品有相当一部分用户会以"不抱回宝宝"的方式结束这段旅程\*\*。这不是边缘场景，是产品必须正面处理的核心场景之一。



\### 15.0.2 五条不可妥协的基本原则



以下五条原则适用于本 PART 所有条款。任何具体设计如果与之冲突，以这五条为准：



\*\*1. 不假装理解原则 (No Pretense of Empathy)\*\*



产品不能写出"我们理解您的痛苦"、"我们感同身受"、"宝宝去了一个更好的地方"这类文字。它不理解，也不该假装理解。\*\*克制的沉默比拙劣的安慰更接近真正的尊重\*\*。



\*\*2. 用户主权原则 (User Sovereignty)\*\*



进入记忆模式、删除数据、退出记忆模式、再次开启——所有决定权完全归用户。系统不主动建议、不催促、不"温柔提醒"、不"为您好"。\*\*用户的沉默不是问题，是回答\*\*。



\*\*3. 默认沉默原则 (Silence by Default)\*\*



进入记忆模式后，\*\*所有非用户主动触发的通信全部关闭\*\*。包括但不限于：推送通知、邮件、短信、App 内 Banner、Toast、引导性弹窗、"我们想你了"邮件、节日问候、忌日提醒、再次妊娠引导。\*\*用户回来时 App 就在那里，用户不回来时 App 就保持沉默\*\*。



\*\*4. 不强迫归因原则 (No Forced Narrative)\*\*



不强迫用户给这件事一个"原因"或"标签"。不要求用户填写"流产 / IUFD / 引产"分类——除非这关系到法定数据保留义务，否则用户有权不告诉系统发生了什么，只说一句"请关闭一切"。



\*\*5. 撤回权原则 (Right to Undo)\*\*



任何进入记忆模式的操作都必须可撤回。用户可能在剧烈情绪中按下按钮，几小时后后悔。所有"不可逆"操作至少有 7 天冷静期（删除请求除外，删除即时生效但提供 30 天恢复窗口）。



\### 15.0.3 措辞总原则



本 PART 涉及的所有用户可见文字必须由有相关经验的女性产品经理 + 产科社工 + 心理咨询师三方审稿，前端开发不允许直接编辑这些字段。所有文案以\*\*配置文件形式存储\*\*，方便不同地区/不同文化背景调整。



```typescript

// src/i18n/sensitive-copy.ts

// 此文件改动需要 sensitive-copy-reviewer 团队审批

export const SENSITIVE\_COPY = {

&#x20; memorialMode: {

&#x20;   entryTitle: '关于结束孕程',

&#x20;   // 不是 "失去宝宝"，不是 "妊娠终止"，是中性的 "结束孕程"

&#x20;   entrySubtitle: '我们可以把应用切换到静默模式',

&#x20;   entryBody: '如果这段时间对您来说很难，我们可以停止所有提醒与提示音。您仍可在需要时手动查看数据。此操作可随时撤回。',

&#x20;   entryPrimary: '进入静默模式',

&#x20;   entrySecondary: '暂不处理',

&#x20;   confirmTitle: '确认进入静默模式？',

&#x20;   confirmBody: '进入后将停止推送、倒计时警报与家属通知。您可随时从设置恢复。',

&#x20;   confirmPrimary: '确认进入',

&#x20;   confirmSecondary: '再想想',

&#x20;   revokeTitle: '撤回静默模式',

&#x20;   revokeBody: '撤回后将恢复常规提醒与监测提示。',

&#x20;   revokePrimary: '恢复常规模式',

&#x20;   revokeSecondary: '保持静默',

&#x20;   deleteTitle: '删除所有本地数据',

&#x20;   deleteBody: '删除后无法在本设备恢复。医院端依法保留的数据不在此范围。',

&#x20;   deletePrimary: '确认删除',

&#x20;   deleteSecondary: '取消'

&#x20; }

} as const

```



\---



\## 15.1 不良结局的类型识别与差异化处理



\### 15.1.1 五种结局类型



虽然原则 4 说不强迫用户归因，但系统\*\*内部\*\*需要区分不同类型来决定数据保留与三端联动行为。区分来源是：

\- 医生端 EMR 录入（最权威）

\- 孕妇/家属在记忆模式入口处的可选填写（可跳过）

\- 默认归类为 `unknown`



```typescript

// src/types/memorial.ts



export type AdverseOutcomeType =

&#x20; | 'early\_miscarriage'      // < 12 周自然流产

&#x20; | 'late\_miscarriage'       // 12-28 周自然流产

&#x20; | 'iufd'                   // 胎死宫内（28 周后）

&#x20; | 'medical\_termination'    // 医学指征引产（致死性畸形、母体危及等）

&#x20; | 'selective\_reduction'    // 多胎妊娠选择性减胎

&#x20; | 'neonatal\_death'         // 极早早产后新生儿夭折

&#x20; | 'unknown'                // 用户未告知 / 选择不分类

&#x20; | 'user\_choice\_other'      // 用户选择"其他原因"结束（包括非医疗原因）



export interface MemorialModeState {

&#x20; enabled: boolean

&#x20; outcomeType: AdverseOutcomeType | null

&#x20; activatedAt: number | null

&#x20; activatedBy: 'patient' | 'guardian' | 'doctor' | 'system\_auto' | null



&#x20; // 用户可选填写（完全自愿，可跳过/可修改/可清空）

&#x20; userNote: string | null



&#x20; // 数据保留策略

&#x20; dataRetention: DataRetentionPolicy



&#x20; // 7 天冷静期窗口

&#x20; canUndoUntil: number | null



&#x20; // 是否允许再次妊娠时复用账户

&#x20; allowFutureReuse: boolean | null  // null = 未询问

}

```



\### 15.1.2 各类型的差异化默认配置



不同结局类型有不同的\*\*法律/医疗/情感\*\*默认处理。但所有默认值用户都可以覆盖。



| 类型 | 法定保留期 | 默认数据可见性 | 默认警报关闭速度 | 医生端归档分类 |

|------|----------|------------|--------------|------------|

| early\_miscarriage | 5 年 | 完全隐藏 | 即时 | 已结束 |

| late\_miscarriage | 10 年 | 完全隐藏 | 即时 | 已结束（保留数据） |

| iufd | 10 年 | 完全隐藏 | 即时 | 已结束（用于科研） |

| medical\_termination | 30 年 | 用户可见 | 即时 | 已结束（医疗记录） |

| selective\_reduction | 30 年 | 用户可见 | 部分（继续监测剩余胎儿）| 持续监测 |

| neonatal\_death | 10 年 | 用户可见 | 即时 | 已结束（含 NICU 记录） |

| unknown | 默认 5 年 | 完全隐藏 | 即时 | 已结束 |

| user\_choice\_other | 默认 5 年 | 完全隐藏 | 即时 | 已结束 |



\*\*特别说明\*\*：



\- `selective\_reduction`（减胎术）是一种特殊情况：用户失去了一胎或多胎，但\*\*仍在继续妊娠\*\*。这种场景需要"部分记忆模式"——警报系统继续运行（剩余胎儿仍需保护），但情感化语言全部关闭、孕周倒计时改为中性显示、家属端"为某某宝宝准备的"内容全部清空。

\- `medical\_termination` 法定保留 30 年是因为这类决定可能涉及未来的医疗复盘、保险理赔、法律追溯。



\### 15.1.3 持续妊娠中的危机检测



不良结局\*\*不是只能事后处理\*\*。妊娠过程中，系统可能检测到先兆性信号。这类时刻的处理是 PART 15 的核心难点。



\#### 信号 1：胎心信号持续消失



如果设备支持胎心检测，连续 N 秒无稳定胎心信号：



\*\*绝对禁止\*\*：



\- 弹窗"未检测到胎心，请立即就医"

\- 任何包含"胎心"、"心跳"、"宝宝"字眼的提示

\- 突发警报音、突发屏幕变色、突发震动

\- "您的宝宝可能有危险"



\*\*正确做法\*\*（措辞经心理学审稿）：



```

顶部出现一行非常轻的横条（非弹窗、非全屏）：



&#x20; 设备未检测到稳定信号。请确认电极位置，或联系您的医生。



&#x20; \[我已知晓]  \[联系医生]

```



\- 用"未检测到稳定信号"代替"胎心消失"

\- 优先归因于设备问题（"请确认电极位置"），不让用户自己跳到最坏结论

\- 提供"联系医生"作为出口，而不是"立即就医"（"立即"在这种语境下是创伤性的）

\- 同时\*\*降低后台报警频率\*\*（避免每秒一次推送，最多 1 次/小时直到用户操作）

\- \*\*医生端同步收到通知\*\*，由医生主动联系患者评估，\*\*不让 App 单独承担告知责任\*\*



\#### 信号 2：检测到大出血/胎膜早破等急性信号



如果设备扩展支持这类检测，参考"胎心信号消失"原则处理。\*\*重点：宁可让医生从临床确认后告知用户，也不要让 App 通过弹窗告知用户\*\*。



\#### 信号 3：异常停用模式



用户连续多日未使用 App / 未连接设备的处理（被动触发记忆模式入口的关键场景）：



```

\- 0-3 天未使用：无任何动作

\- 4-7 天未使用：无任何动作（不发"我们想你了"）

\- 8-14 天未使用：App 主页在用户再次打开时显示中性问候，不显示孕周

&#x20;                 顶部出现可关闭的小提示："如果您的情况发生了变化，可以更新您的状态。"

\- 15-30 天未使用：仍无主动推送

&#x20;                 仅在用户再次打开 App 时，提供"您是否希望调整账户状态？"的可跳过引导

\- > 30 天未使用：发送一封中性邮件（不是推送）：

&#x20;                 "我们注意到您较长时间未使用知微。如果您希望调整账户状态，

&#x20;                  可以登录后在设置中操作。无论您是否回来，我们都会保留您的数据。"

&#x20;                 此邮件最多发送一次，永不重复

```



\---



\## 15.2 进入记忆模式的五个通道



v2 只设计了"设置页底部入口"一个通道。但真实场景需要 5 个通道并存：



\### 15.2.1 通道 A：孕妇主动入口（设置页）



设置页底部入口（v2 已有，但需要重新设计文案）：



```

\[ 关于结束这段孕程 → ]

```



\*\*不要写\*\*"孕程结束"（陈述句给人最终性压力），写"关于结束这段孕程"（关于某事 = 讨论可能性，留有余地）。



点击后进入说明页：



```

┌──────────────────────────────────────────────────────┐

│  关于结束这段孕程                                       │

│                                                      │

│  无论以何种方式，当您觉得这段旅程要结束时——              │

│  无论是顺利分娩，还是其他原因——                         │

│  您可以让"知微"停下来。                                 │

│                                                      │

│  您可以选择：                                          │

│                                                      │

│  ○ 暂停一切提醒，保留数据                              │

│    我们将停止所有通知、关闭警报系统、隐藏孕周显示。      │

│    您的所有历史数据将被加密保存，您可以随时回来查看。   │

│                                                      │

│  ○ 导出数据后注销                                      │

│    将您的全部数据打包导出（PDF + 原始信号文件），       │

│    然后清除您在本应用的账户。                          │

│                                                      │

│  ○ 我还没准备好做选择                                  │

│    返回，无事发生。                                    │

│                                                      │

│  ────────────────────────                            │

│                                                      │

│  您愿意告诉我们发生了什么吗？(完全自愿，可跳过)          │

│                                                      │

│  \[跳过]                                              │

│                                                      │

│  这有助于：                                            │

│    · 让医生在合适的时机为您提供后续支持                │

│    · 让您的家属看到的版本与您一致                      │

│                                                      │

└──────────────────────────────────────────────────────┘

```



\*\*关键设计点\*\*：



\- 提供"我还没准备好做选择"作为默认平等选项，\*\*与其他两个并列\*\*，不藏在小字里

\- 用"暂停一切提醒"代替"进入静默模式"——动作描述比状态命名更准确

\- 不解释"为什么需要让医生知道"，只说"这有助于……"

\- "您愿意告诉我们发生了什么吗"放在最后，且明确"完全自愿，可跳过"



\### 15.2.2 通道 B：异常行为被动触发



如 15.1.3 信号 3 描述的"长期未使用后的中性引导"。\*\*关键：永远不是 push 通知，永远是用户自己回来时才触发\*\*。



\### 15.2.3 通道 C：家属代操作通道



真实场景：丈夫陪妻子从医院回家，妻子在床上无法言语，丈夫想帮她关掉所有可能引起痛苦的提醒。



家属端入口：



```

家属端 Settings → 紧急援助 → \[代为操作记忆模式]

```



进入后：



```

┌──────────────────────────────────────────────────────┐

│  代为操作记忆模式                                       │

│                                                      │

│  此功能用于：当小雅暂时无法或不愿意自己操作时，          │

│  您可以代为暂停所有提醒。                              │

│                                                      │

│  如果您此刻选择代为操作：                              │

│    · 立即停止向小雅推送所有通知                         │

│    · 立即关闭警报系统                                  │

│    · 立即隐藏孕周和"今日数据"等显示                     │

│    · 通知主治医生王X，由医生在合适时机联系小雅           │

│                                                      │

│  这个操作可以撤回。                                    │

│  小雅打开 App 后，可以看到您代为操作的记录，            │

│  也可以选择继续保持，或者恢复。                         │

│                                                      │

│  ──────────────────                                  │

│                                                      │

│  \[ 我现在代为操作 ]                                    │

│                                                      │

│  \[ 取消 ]                                             │

└──────────────────────────────────────────────────────┘

```



\*\*关键设计点\*\*：



\- 不需要解释发生了什么，不需要分类

\- 不需要密码/二次验证（家属已绑定身份，紧急时多一步都是阻碍）

\- 操作后\*\*自动通知主治医生\*\*——这是把"告知小雅"的责任转移给医生，而不是让家属或 App 来承担

\- 明确告诉家属"这可以撤回"——降低家属的操作压力



家属代操作后，孕妇端打开 App 看到的版本：



```

┌──────────────────────────────────────────────────────┐

│  陈X 在 14:23 暂停了知微的所有提醒                      │

│                                                      │

│  您可以选择：                                          │

│                                                      │

│  ○ 继续保持暂停状态                                    │

│  ○ 我想自己决定该怎么处理                              │

│                                                      │

│  无论您选择什么，都不会有人收到通知。                   │

└──────────────────────────────────────────────────────┘

```



\### 15.2.4 通道 D：医生代操作通道



最权威的触发通道。医生在 EMR 系统录入妊娠结局（IUFD、流产、引产等）后，医生端自动弹窗：



```

┌──────────────────────────────────────────────────────┐

│  患者妊娠结局已录入                                     │

│                                                      │

│  患者：张小雅                                          │

│  录入结局：胎死宫内 (IUFD)                              │

│  录入时间：2025-11-14 15:32                            │

│                                                      │

│  是否同步处理知微账户？                                 │

│                                                      │

│  ☑ 立即关闭所有警报与紧急覆盖                          │

│  ☑ 停止向患者端推送一切通知                            │

│  ☑ 通知患者家属（按预设家属顺序）                       │

│  ☑ 将患者从"在监测"队列移至"已结束"                    │

│  ☐ 自动安排 7 天后的随访（默认不勾选，由医生评估）      │

│                                                      │

│  ⓘ 这些操作会立刻生效。                                │

│  ⓘ 您有 60 秒可以撤销，以防误录入。                    │

│                                                      │

│  \[ 60 秒后自动执行 ]    \[ 立即执行 ]    \[ 取消 ]       │

└──────────────────────────────────────────────────────┘

```



\*\*关键设计点\*\*：



\- 60 秒倒计时是为了\*\*误录入保护\*\*——医生在 EMR 输入信息时手滑录错的可能性不为零

\- 通知家属是\*\*医生的职责\*\*而不是 App 的职责——但 App 提供工具让医生快速完成

\- "自动安排 7 天后的随访"默认不勾选——这是医疗决策，必须医生主动确认

\- 同步执行后，患者端的所有显示\*\*立刻变为静默模式视觉\*\*，不会让用户先看到"宝宝今日很活跃"再看到"已转入静默"



\### 15.2.5 通道 E：人工客服通道（兜底）



主页脚 + 设置页底部均有一个极轻的链接：



```

需要帮助？联系我们 →

```



跳转到一个极简页面：



```

┌──────────────────────────────────────────────────────┐

│  联系我们                                              │

│                                                      │

│  如果您遇到 App 无法处理的情况，                        │

│  无论是技术问题、账户问题，还是其他任何问题，            │

│  请联系：                                              │

│                                                      │

│  📞 400-XXX-XXXX  （9:00-21:00）                      │

│  ✉  support@zhiwei.health                            │

│                                                      │

│  您不需要解释您的具体情况，                            │

│  只要告诉我们您希望我们做什么就好。                     │

└──────────────────────────────────────────────────────┘

```



\*\*关键设计点\*\*：



\- 客服话术规范单独成档，所有客服人员必须经过\*\*敏感场景应答培训\*\*

\- 客服\*\*有权代为执行所有记忆模式操作\*\*（验证身份后）

\- 客服\*\*禁止\*\*在通话中主动提及"宝宝"、"流产"、"失去"等词汇——除非用户主动提及



\---



\## 15.3 灾难性时刻的紧急中止机制



\### 15.3.1 警报系统的强制熔断



当通道 C 或 D 被触发时，所有正在进行中的警报必须\*\*立即且不可逆地\*\*中止：



```typescript

// src/store/alerts.ts



function forceAbortAllAlerts(reason: 'memorial\_mode\_activated') {

&#x20; // 立即清空所有活动警报

&#x20; set({ activeAlert: null })



&#x20; // 立即关闭 EmergencyOverlay

&#x20; closeEmergencyOverlay()



&#x20; // 取消所有倒计时呼叫

&#x20; cancelAllCountdownCalls()



&#x20; // 通知所有已接收警报的家属："警报已由医生/家属确认结束"

&#x20; // 注意：通知文案不能透露原因

&#x20; notifyGuardiansOfAlertEnd('警报已结束')



&#x20; // 记入审计日志（但不可恢复警报本身）

&#x20; auditLog.record({

&#x20;   type: 'force\_abort\_all\_alerts',

&#x20;   reason,

&#x20;   timestamp: Date.now(),

&#x20; })

}

```



\*\*关键\*\*：通知家属"警报已结束"时\*\*不能写明原因\*\*（不写"经医生确认 IUFD 后关闭"），因为家属可能在不同时机看到这条消息，可能正好是其他家属还不知道真相的时机。原因的告知由家属间面对面沟通，\*\*不通过 App 转述\*\*。



\### 15.3.2 设备摘下的智能处理



记忆模式启用后，设备摘下的处理逻辑完全改变：



```typescript

// 常规模式下：

//   设备摘下 → 提示"设备已断开，请重新佩戴"，持续提醒



// 记忆模式下：

//   设备摘下 → 完全静默，不提示

//   设备保持摘下 24 小时后 → 不提示

//   设备保持摘下 7 天后 → App 自动建议"是否取消设备配对？"（仅在用户打开 App 时显示）

//   设备保持摘下 30 天后 → 静默自动取消配对，向用户发一封中性邮件告知（仅一次）

```



\### 15.3.3 持续妊娠中断的特殊情况



如果用户处于 `selective\_reduction`（选择性减胎）状态：



\- 监测系统\*\*继续运行\*\*（剩余胎儿仍需保护）

\- 警报系统继续运行

\- 但\*\*所有数据可视化的语言改为"宫缩"而非"胎儿"，"您的子宫"而非"宝宝"\*\*

\- 胎心相关展示被完全隐藏（哪怕剩余胎儿胎心正常，避免触发对失去胎儿的回忆）

\- 孕周仍显示，但不显示"距离预产期还有多少天"这类期待性文案



\---



\## 15.4 进入静默模式后的完整行为规范



v2 只规定了"不显示孕周、不显示宝宝字眼"。这远远不够。



\### 15.4.1 视觉与文案变化



\*\*全局变化\*\*：



```css

/\* 静默模式下的视觉调整 \*/

\[data-memorial="true"] {

&#x20; /\* 状态色饱和度降低 30%，避免任何鲜艳色块 \*/

&#x20; filter: saturate(0.7);



&#x20; /\* 字体行高放大，视觉更"安静" \*/

&#x20; --line-height-base: 1.85;



&#x20; /\* 横幅、徽章、装饰元素全部去除 \*/

}

```



\*\*全文案审查替换表\*\*：



| 常规模式 | 静默模式 |

|---------|---------|

| 上午好，小雅 | 您好 |

| 孕 32 周 + 3 天 | （完全不显示） |

| 距离预产期还有 X 周 | （完全不显示） |

| 今日宫缩 / 今日胎动 | （完全不显示） |

| 您已连续守护 X 天 | （完全不显示） |

| 设备已连接 / 设备已断开 | （完全不显示） |

| 警报历史 | 历史记录 |

| 紧急联系人 | 联系人 |

| 主治医生 王X | 联系人：王X |



\*\*首页布局\*\*（静默模式）：



```

┌──────────────────────────────────────────────────────┐

│                                                      │

│                                                      │

│                                                      │

│                                                      │

│                     您好                              │

│                                                      │

│                                                      │

│        如果您想做些什么，可以从左侧菜单进入。          │

│                                                      │

│                                                      │

│                                                      │

│                                                      │

│                                                      │

└──────────────────────────────────────────────────────┘

```



主页\*\*几乎是空的\*\*。不显示任何统计、提醒、活动建议。仅有一句中性问候和一行说明。



\### 15.4.2 历史数据访问规则



```

\[ ] 默认隐藏所有历史数据入口

\[ ] 用户必须主动从设置 → "查看历史数据" 进入

\[ ] 进入历史数据前显示二次确认：

&#x20;   "您将查看 2025-11-14 之前的监测数据。

&#x20;    是否继续？

&#x20;    \[继续] \[取消]"

\[ ] 历史数据视图本身也使用静默模式视觉

\[ ] 查看历史数据时，所有数据点 hover 不显示"距离预产期"等期待性数据

\[ ] 不提供导出功能默认显示，只在二级菜单"我需要这些数据"中提供

```



\### 15.4.3 通知规则



\*\*完全静默\*\*意味着：



| 通知类型 | 常规模式 | 静默模式 |

|---------|---------|---------|

| 警报推送 | ✓ | ✗ |

| 监测建议 | ✓ | ✗ |

| 用药提醒 | ✓ | ✗ |

| 产检提醒 | ✓ | ✗ |

| 健康课堂内容更新 | ✓ | ✗ |

| 设备电量提醒 | ✓ | ✗ |

| 数据周报/月报 | ✓ | ✗ |

| 节日问候 | ✓ | ✗ |

| 应用版本更新 | ✓ | ✗（仅在打开时显示） |

| 系统安全提醒 | ✓ | ✓（仅限账户安全，如异常登录） |

| 客服回复 | ✓ | ✓（用户主动联系后） |



唯一保留：\*\*账户安全相关通知\*\*（异常登录、密码修改等）和\*\*用户主动发起对话后的客服回复\*\*。



\### 15.4.4 静默模式 banner 的最终规范



```

此账户处于静默模式 · \[更改]

```



颜色：`color: var(--text-muted)`，无背景色，无图标，无动画。



\*\*为什么这样设计\*\*：



\- 任何"温暖"色彩都会变成对失去的反复确认

\- "记忆模式"、"哀思模式"这类命名是 App 替用户解释她的状态，\*\*用户没要求 App 这么做\*\*

\- "静默"是描述系统行为的，不是描述用户状态的

\- "\[更改]"链接是为了\*\*用户随时可以脱离\*\*——这一点必须随时可见



\---



\## 15.5 数据时间胶囊（Data Time Capsule）



\### 15.5.1 软删除与硬删除



| 操作 | 实际行为 | 用户可见的描述 |

|------|---------|--------------|

| "暂停一切提醒，保留数据" | 数据本地加密保留，云端保留 | "您的数据已加密保存" |

| "导出数据后注销" | 立即软删除，30 天后硬删除 | "您的账户将在 30 天后彻底删除" |

| 用户在 30 天内重新登录 | 自动恢复账户 | "欢迎回来" |

| 30 天后 | 硬删除，云端无任何残留 | （邮件告知，仅一次） |



\### 15.5.2 法定保留期的冲突处理



某些情况下，法律要求医疗数据保留特定年限（如 medical\_termination 30 年），与用户"立即彻底删除"请求冲突时：



```

┌──────────────────────────────────────────────────────┐

│  关于您的数据删除请求                                   │

│                                                      │

│  根据《医疗器械数据合规管理办法》第 X 条，              │

│  与医学引产相关的监测数据需要在医疗机构保留 30 年。     │

│                                                      │

│  您的请求将这样处理：                                   │

│                                                      │

│  ✓ 知微 App 端的所有数据将立即删除                      │

│  ✓ 您将无法再通过本 App 访问这些数据                   │

│  ✓ 医疗机构端的备份将依法保留 30 年                    │

│  ✓ 该备份只能用于您本人后续诊疗或法律要求               │

│  ✓ 30 年后，医疗机构端的备份也将销毁                    │

│                                                      │

│  您可以联系您的主治医院询问医疗记录访问方式。            │

│                                                      │

│  \[ 我理解，继续删除 ]    \[ 取消 ]                      │

└──────────────────────────────────────────────────────┘

```



\*\*关键\*\*：完全透明告知用户"哪些数据会被删除，哪些不会"，不用"为了您的健康"等温情话术包装法律义务。



\### 15.5.3 数据访问权的传承



如果用户在记忆模式下永久不再登录（极端情况），数据访问权按以下顺序传递：



1\. 第一通知人（家属）—— 仅在用户超过 2 年未登录后

2\. 主治医生 —— 仅在医疗诉讼等法定情况下

3\. 法定继承人 —— 仅在用户死亡证明出具后



每一级访问都需要明确的法律授权，\*\*App 默认不主动激活\*\*任何继承机制。



\---



\## 15.6 三端协同的具体协议



\### 15.6.1 触发源与同步策略



```typescript

interface MemorialModeTrigger {

&#x20; source: 'patient' | 'guardian' | 'doctor' | 'system\_auto'

&#x20; syncStrategy: 'immediate' | 'delayed'

&#x20; visibilityToOthers: VisibilityRule

}



const TRIGGER\_RULES: Record<string, MemorialModeTrigger> = {

&#x20; 'patient': {

&#x20;   source: 'patient',

&#x20;   syncStrategy: 'immediate',  // 孕妇本人决定，立即三端生效

&#x20;   visibilityToOthers: {

&#x20;     // 家属看到："小雅暂停了所有提醒。如果您想了解，请直接联系她。"

&#x20;     // 医生看到："患者主动进入静默模式（未说明原因）。请考虑随访。"

&#x20;   }

&#x20; },

&#x20; 'guardian': {

&#x20;   source: 'guardian',

&#x20;   syncStrategy: 'immediate',

&#x20;   visibilityToOthers: {

&#x20;     // 其他家属看到："陈X 代为暂停了小雅的所有提醒。"

&#x20;     // 医生看到："家属代为操作静默模式。建议主动联系患者评估。"

&#x20;     // 孕妇看到的内容见 15.2.3

&#x20;   }

&#x20; },

&#x20; 'doctor': {

&#x20;   source: 'doctor',

&#x20;   syncStrategy: 'immediate',

&#x20;   visibilityToOthers: {

&#x20;     // 家属看到："警报已结束。"（不告知原因，由家属面对面沟通）

&#x20;     // 孕妇看到："您的主治医生已为您调整账户状态。"

&#x20;     //         （不说"已关闭"，给用户继续与医生沟通的余地）

&#x20;   }

&#x20; },

&#x20; 'system\_auto': {

&#x20;   source: 'system\_auto',

&#x20;   syncStrategy: 'delayed',  // 自动触发的延迟 24 小时，期间用户可撤销

&#x20;   visibilityToOthers: {

&#x20;     // 其他端：完全不通知（自动触发可能是误判）

&#x20;   }

&#x20; },

}

```



\### 15.6.2 信息隔离原则



\*\*最关键的协议\*\*：\*\*通知内容必须分角色定制，避免让某个角色在错误的时机得知错误的信息\*\*。



具体场景：



\- 妈妈刚做完手术，丈夫已知情，但异地的婆婆还不知道。如果 App 推给婆婆"小雅的警报已结束"，婆婆可能误以为是好消息，打电话问"是不是宫缩控制住了"，造成二次伤害。

\- 解决方案：\*\*异地不在场家属\*\*默认收到的版本是\*\*完全无变化通知\*\*——一切照旧显示"过去 24 小时无新事件"等中性内容。\*\*真相由在场家属面对面告知\*\*。



实现：



```typescript

// 家属端通知决策树

function shouldNotifyGuardian(

&#x20; guardian: GuardianMember,

&#x20; event: MemorialModeEvent

): NotificationDecision {

&#x20; // 异地（距离 > 100km）+ 非紧急联系人 → 默认不主动通知

&#x20; if (guardian.currentStatus.distanceToPatient > 100\_000

&#x20;     \&\& !guardian.isPrimaryContact) {

&#x20;   return {

&#x20;     send: false,

&#x20;     reason: 'distance\_protection',

&#x20;     // 但保留 fallback：如果首要联系人主动 "告知所有人" → 才发

&#x20;   }

&#x20; }



&#x20; // 紧急联系人 + 已在场 → 发送中性通知

&#x20; if (guardian.isPrimaryContact || guardian.currentStatus.distanceToPatient < 5\_000) {

&#x20;   return {

&#x20;     send: true,

&#x20;     content: getNeutralNotification(event),

&#x20;   }

&#x20; }



&#x20; // 其他：不主动通知，但 App 内可查

&#x20; return { send: false, reason: 'passive\_visibility' }

}

```



\### 15.6.3 医生端的归档分类



患者列表新增分类：



```

\[ 在监测 (24) ]   \[ 已结束 (7) ]   \[ 静默中 (3) ]

```



\- \*\*已结束\*\*：明确录入了不良结局或顺利分娩的患者

\- \*\*静默中\*\*：进入了记忆模式但未明确录入结局的患者（医生需要主动评估随访）

\- 医生主动取消订阅某患者后归入"已结束"



医生端"静默中"分类的患者列表，每条多一栏：



```

姓名     最后活跃    静默原因           建议

─────────────────────────────────────────────────

张小雅   11-14      患者主动 (未说明)   建议 7 天后电话随访

李慧    11-10      家属代操作          已电话联系，待回复

王X     11-08      系统检测异常停用    建议联系评估

```



\---



\## 15.7 文案与措辞规范（强制约束）



\### 15.7.1 黑名单（永久禁用词）



以下词汇在记忆模式下\*\*永久禁用\*\*，且在常规模式下也\*\*默认禁用\*\*（仅当用户主动开启"昵称模式"且未进入记忆模式时可有限使用）：



```typescript

export const BLACKLIST\_WORDS = \[

&#x20; '宝宝', '宝贝', '小生命', '小天使', '小心肝',

&#x20; '准妈妈', '妈咪', '小妈妈',

&#x20; '失去', '离开', '远去', '逝去', '走了',

&#x20; '更好的地方', '在天上', '小天堂',

&#x20; '坚强', '勇敢', '加油',

&#x20; '下一个会更好', '再来一个', '再生一个',

&#x20; '理解', '感同身受', '我们懂', '我们陪您',

&#x20; '哀悼', '节哀', '保重',

]



// 代码审查工具会扫描所有 .tsx/.ts 文件，

// 任何字符串包含黑名单词汇 → CI 自动失败

```



\### 15.7.2 写作准则



如果必须给用户呈现某段文字，遵循以下准则：



1\. \*\*陈述事实，不评价\*\*：写"系统已停止推送通知"，不写"您可以好好休息了"。

2\. \*\*第二人称克制\*\*：用"您"而不是"您和您的家人"；用"这段经历"而不是"您所经历的痛苦"。

3\. \*\*不预设情绪\*\*：不写"我们知道您现在很难过"——你不知道。也许用户已经走出来了，也许从未陷入过，也许此刻只是想关掉一个 App。

4\. \*\*提供选项，不给建议\*\*：列出"您可以做 A/B/C"，不写"我们建议您 A"。

5\. \*\*不使用感叹号\*\*。

6\. \*\*不使用 emoji\*\*。

7\. \*\*不使用引号包装的诗意短语\*\*。



\### 15.7.3 沉默优先



\*\*当不确定该说什么时，不说\*\*。空白是有效的设计。下面这样的页面是合格的：



```

┌──────────────────────────────────────────────────────┐

│                                                      │

│                                                      │

│                                                      │

│                                                      │

│                     您好                              │

│                                                      │

│                                                      │

│                                                      │

│                                                      │

└──────────────────────────────────────────────────────┘

```



\---



\## 15.8 再次妊娠的处理



\### 15.8.1 检测信号



用户在静默模式下，可能再次怀孕。系统\*\*不主动检测\*\*这件事。但提供入口：



设置 → "我有了新的开始" →



```

┌──────────────────────────────────────────────────────┐

│  开始新的孕程                                          │

│                                                      │

│  欢迎回来。                                            │

│                                                      │

│  您可以选择如何使用知微：                              │

│                                                      │

│  ○ 全新开始                                            │

│    创建一个干净的新孕程，不参考之前的任何数据。         │

│    您之前的数据仍然保留，但不会在新孕程中被使用。       │

│                                                      │

│  ○ 参考之前的数据                                      │

│    新孕程将参考您之前的监测数据，                       │

│    用于个性化的早产风险预测。                          │

│    您的主治医生将能看到之前的完整记录。                │

│                                                      │

│  ○ 我还在考虑                                          │

│    返回，不创建新孕程。                                │

│                                                      │

└──────────────────────────────────────────────────────┘

```



\### 15.8.2 "全新开始"的实现细节



\- 所有 UI 显示如同首次注册

\- 但\*\*警报灵敏度悄悄默认调高一档\*\*（PTSD 倾向用户对警报的耐受可能极低，\*\*也可能极高\*\*——但默认偏保守）

\- 不告知用户"由于您的既往史，我们调整了灵敏度"——这会变成对过去的提醒

\- 医生端\*\*会\*\*收到完整的既往数据（这是医疗必要性，与用户的"全新开始"愿望无关，但医生\*\*必须遵守\*\*：不在与患者沟通时主动提及既往，除非患者主动提起）



\### 15.8.3 "参考之前的数据"的实现细节



\- 医生端可解释性面板的"类比患者"会包含该患者自己的上次妊娠数据

\- SHAP 特征贡献会显示"既往早产史"作为一项

\- 但\*\*患者端\*\*仍不显示任何"上次"的比较数据

\- 患者端如主动想看，需要进入"历史数据"模式（需要二次确认）



\### 15.8.4 多次妊娠史的管理



支持一个用户有多个孕程档案。每个孕程独立保留数据，但医生端可看全部历史。



\---



\## 15.9 数据合规



\### 15.9.1 法定保留期对照表



参考 15.1.2 的表格。



\### 15.9.2 跨境数据



若用户搬迁至其他国家/地区，需根据当地法规处理：

\- 默认禁止跨境传输

\- 用户可申请数据迁移，需用户、原医疗机构、目标地区合规机构三方书面同意



\### 15.9.3 删除请求的处理时限



参考 GDPR / 国内《个人信息保护法》：

\- 删除请求 24 小时内响应

\- 30 天内完成（含恢复窗口）

\- 完成后向用户发送一次性确认邮件



\---



\## 15.10 Mock 场景剧本（新增 4 个）



在 v2 PART 12.4 的 8 个 mock scenarios 基础上，新增：



\### scenario\_loss\_early\_user\_initiated



\*\*场景\*\*：演示用户主动进入记忆模式的完整流程。

\*\*剧本\*\*：

1\. 切换到孕妇端，正常状态

2\. 进入设置 → 点击"关于结束这段孕程"

3\. 演示三选项页面

4\. 选择"暂停一切提醒，保留数据"

5\. 选择"不告诉系统发生了什么"

6\. 进入静默模式

7\. 演示首页变化、侧边栏变化、状态横幅出现

8\. 切换到家属端，演示家属收到的中性通知

9\. 切换到医生端，演示患者从"在监测"移到"静默中"



\### scenario\_iufd\_doctor\_initiated



\*\*场景\*\*：演示医生在 EMR 录入 IUFD 后的完整三端同步流程。

\*\*剧本\*\*：

1\. 切换到医生端，进入张小雅的患者详情页

2\. 在临床备注中录入"妊娠结局：胎死宫内 IUFD"

3\. 自动弹出"是否同步处理知微账户"对话框

4\. 演示 60 秒倒计时

5\. 医生勾选默认选项，点击立即执行

6\. 切换到家属端，演示在场家属（丈夫）收到"警报已结束"通知

7\. 演示异地家属（妈妈）\*\*未收到任何通知\*\*——信息隔离协议

8\. 切换到孕妇端，演示自动进入静默模式，显示"您的主治医生已为您调整账户状态"



\### scenario\_family\_initiated\_silence



\*\*场景\*\*：演示家属代操作记忆模式。

\*\*剧本\*\*：

1\. 从家属端（丈夫陈X）进入设置 → 紧急援助

2\. 点击"代为操作记忆模式"

3\. 演示说明页

4\. 点击"我现在代为操作"

5\. 切换到孕妇端，演示打开 App 看到的"陈X 在 14:23 暂停了知微的所有提醒"页面

6\. 孕妇选择"继续保持暂停状态"

7\. 演示后续状态



\### scenario\_subsequent\_pregnancy



\*\*场景\*\*：演示从静默模式开始新孕程的流程。

\*\*剧本\*\*：

1\. 用一个已处于静默模式的患者账户

2\. 在设置中找到"我有了新的开始"入口

3\. 演示三选项页面

4\. 选择"全新开始"

5\. 演示新孕程的初始化（注意 UI 不应包含任何对过去的提及）

6\. 切换到医生端，演示医生看到的完整历史（与患者端的"干净开始"形成对比）

7\. 演示医生端可解释性面板包含既往妊娠数据



\---



\## 15.11 测试与审查清单（验收时必查）



```

□ 静默模式下，全代码搜索黑名单词汇（PART 15.7.1）：0 命中

□ 静默模式下，首页字段统计：≤ 5 个可见元素

□ 静默模式下，运行所有 mock scenarios 中触发警报的场景：警报系统不响应

□ 静默模式下，连接/断开设备：无任何 UI 提示

□ 静默模式下，时间到达预设的产检提醒时刻：无提醒

□ 五个进入通道（A-E）均可独立触发，互不依赖

□ 60 秒撤销窗口（通道 D）：实际可在 60 秒内中止

□ 7 天冷静期：用户可在 7 天内一键退出静默模式

□ 信息隔离协议：异地家属不会收到状态变更通知

□ 数据软删除：用户可在 30 天内通过重新登录恢复

□ 数据硬删除：30 天后，数据库中无该用户任何记录

□ 法定保留期数据：硬删除后，医院端仍可访问

□ 再次妊娠"全新开始"模式：患者端 UI 中无任何对既往的引用

□ 再次妊娠"全新开始"模式：医生端可见完整既往数据

□ 通知内容审查：所有通知文案经 sensitive-copy-reviewer 团队审批

□ 客服培训：所有客服已通过敏感场景应答培训

□ A/B 测试禁令：本 PART 涉及的所有界面禁止 A/B 测试

□ 数据埋点禁令：静默模式下的用户行为不上报任何分析事件

&#x20;  （仅保留必要的功能日志用于 bug 排查，且必须匿名化）

```



\---



\## 15.12 团队工作准则



实现本 PART 的工程师、设计师、PM 需要先阅读以下材料：



1\. 《Pregnancy Loss and Stillbirth: A Healthcare Provider's Guide》(WHO, 2024)

2\. 《国内三甲医院产科社工服务规范》

3\. 至少观看一部相关纪录片（推荐《产科男医生》某些集次）

4\. 至少访谈 3 位经历过不良妊娠结局的女性用户（通过合规 IRB 流程）



\*\*这不是炫技场\*\*。本 PART 实现质量的评判标准只有一个：\*\*在最坏的事情发生时，这个 App 是否做到了无声、无害、不在场也不缺席\*\*。



\---



\## 15.13 不变量声明（Invariants，验收前必须证明）



以下属性必须在任何代码路径下成立：



```typescript

// 不变量 1：静默模式下，警报系统不可被任何触发器激活

∀ frame ∈ FrameBuffer, memorialMode.enabled === true

&#x20; → triggerAlert(\*) === no-op



// 不变量 2：静默模式下，PUSH 通知 API 不被调用

∀ event, memorialMode.enabled === true

&#x20; → sendPushNotification(\*) === no-op

&#x20; // 例外：系统安全相关通知（账户异常登录等）



// 不变量 3：黑名单词汇不出现在任何渲染的 DOM 文本中

∀ rendered\_text ∈ DOM, memorialMode.enabled === true

&#x20; → ¬contains(rendered\_text, BLACKLIST\_WORDS)



// 不变量 4：医生触发的 60 秒倒计时可被中止

∀ doctor\_trigger, ∃ cancel\_action ∈ \[0s, 60s]

&#x20; → memorialMode.enabled === false (after cancel)



// 不变量 5：硬删除后，无残留

∀ user, hardDeleteRequested(user) + 30 days

&#x20; → query(database, user.id) === ∅

&#x20; // 法定保留例外：医院端备份（不在本 App 数据库内）



// 不变量 6：信息隔离

∀ guardian, distance(guardian, patient) > 100km ∧ ¬isPrimaryContact(guardian)

&#x20; → notifyOnMemorialModeChange(guardian) === no-op

&#x20; // 例外：首要联系人主动触发"通知所有人"

```



实现完成后，针对每个不变量编写至少 1 个单元测试，并在 CI 中作为强制门禁。



\---



> 本 PART 是 "知微" v2 prompt 的伦理底线。

> 编码 agent 在实现时如果在主 prompt 和本 PART 之间发现冲突，\*\*以本 PART 为准\*\*。

> 如果工程师认为某条规范"过于严格、影响用户体验"，请记住：

> 本 PART 的服务对象不是普通用户，而是\*\*正在经历或刚刚经历人生最痛苦时刻的用户\*\*。

> 她们不需要"良好的用户体验"，她们需要一个\*\*不再打扰她们的 App\*\*。
