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
    code: 'scenario_contractions_rising',
    label: '宫缩频率上升',
    summary: '突出宫缩趋势抬升与风险解释联动，用于风险升级演示。',
    battery: '88%',
    electrodeQuality: '91%',
    connection: '采集中'
  },
  {
    id: 3,
    code: 'scenario_electrode_loose',
    label: '设备电极松动',
    summary: '展示设备状态下降、信号质量提醒与用户纠正引导。',
    battery: '84%',
    electrodeQuality: '72%',
    connection: '需校准'
  },
  {
    id: 4,
    code: 'scenario_fetal_movement_low',
    label: '胎动减少',
    summary: '适合演示多信号联合判断与患者侧的安抚式提示。',
    battery: '86%',
    electrodeQuality: '89%',
    connection: '蓝牙稳定'
  },
  {
    id: 5,
    code: 'scenario_night_alert',
    label: '夜间紧急预警',
    summary: '用于展示升级提醒、家属联动与倒计时取消交互。',
    battery: '76%',
    electrodeQuality: '87%',
    connection: '高优先级'
  },
  {
    id: 6,
    code: 'scenario_family_coordination',
    label: '家属协作升级',
    summary: '强调多人协同响应，避免重复赶往与信息黑洞。',
    battery: '82%',
    electrodeQuality: '90%',
    connection: '协作同步'
  },
  {
    id: 7,
    code: 'scenario_family_flow',
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
