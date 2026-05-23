export interface MockScenarioDefinition {
  id: number
  code: string
  label: string
  summary: string
  battery: string
  electrodeQuality: string
  connection: string
}

export const mockScenarios: MockScenarioDefinition[] = [
  {
    id: 1,
    code: 'scenario_normal',
    label: '正常稳定监测',
    summary: '适合向投资人与临床老师展示系统默认节奏与平稳状态。',
    battery: '92%',
    electrodeQuality: '96%',
    connection: '蓝牙稳定'
  },
  {
    id: 2,
    code: 'scenario_braxton',
    label: '频繁假性宫缩',
    summary: '用于演示假性宫缩增多但整体风险仍可控的状态判断。',
    battery: '88%',
    electrodeQuality: '91%',
    connection: '采集中'
  },
  {
    id: 3,
    code: 'scenario_preterm',
    label: '早产先兆升级',
    summary: '展示风险曲线逐步升高、家属提前介入与医生复核入口。',
    battery: '85%',
    electrodeQuality: '89%',
    connection: '风险监测'
  },
  {
    id: 4,
    code: 'scenario_emergency',
    label: '突发紧急状态',
    summary: '用于演示红色紧急流程与倒计时呼叫范式。',
    battery: '74%',
    electrodeQuality: '86%',
    connection: '高优先级'
  },
  {
    id: 5,
    code: 'scenario_electrode_loose',
    label: '电极脱落处理',
    summary: '展示连接降级、设备提示与安全降级策略。',
    battery: '79%',
    electrodeQuality: '54%',
    connection: '需校准'
  },
  {
    id: 6,
    code: 'scenario_fall',
    label: '跌倒检测',
    summary: '触发 IMU 异常与紧急确认链路，验证误报反馈机制。',
    battery: '77%',
    electrodeQuality: '81%',
    connection: '姿态异常'
  },
  {
    id: 7,
    code: 'scenario_multi_alert',
    label: '家属协作流',
    summary: '聚焦团队角色切换、状态透传与协作视角差异化。',
    battery: '81%',
    electrodeQuality: '88%',
    connection: '协作同步'
  },
  {
    id: 8,
    code: 'scenario_doctor_override',
    label: '医生覆盖流程',
    summary: '演示医生端对算法结论提出质疑并执行临床覆盖的过程。',
    battery: '90%',
    electrodeQuality: '94%',
    connection: '院内联机'
  }
]

export const getMockScenarioDefinition = (scenarioId: number) =>
  mockScenarios.find((scenario) => scenario.id === scenarioId) ?? mockScenarios[0]
