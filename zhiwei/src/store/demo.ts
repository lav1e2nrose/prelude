import { useAlertsStore } from './alerts'
import { useCollaborationStore } from './collaboration'
import { useDoctorStore } from './doctor'
import { usePatientJournalStore } from './patientJournal'
import { usePrenatalStore } from './prenatal'
import { useRealtimeStore } from './realtime'
import { useSettingsStore } from './settings'

// 演示模式总开关：一处切换，统一编排数据源、算法引擎与各端演示数据。
// 这是 mock/真实彻底分离的关键——
//   开启：mock 设备 + mock 算法 + 自动连接 + 载入三端演示数据（孕妇日志、警报、协作、医生名册）
//   关闭：断开设备、切回真实(BLE+远程算法)、清空所有演示数据 → 真实模式不残留任何模拟数据

export const applyDemoMode = (on: boolean): void => {
  const realtime = useRealtimeStore.getState()
  const settings = useSettingsStore.getState()

  settings.setDev({ useMockDataSource: on, useMockRiskEngine: on })

  if (on) {
    realtime.setDataSourceType('mock')
    realtime.setRiskEngineMode('mock')
    realtime.patchSourceConfig('mock', { intervalMs: 200 }) // 5Hz，波形流动顺滑
    usePatientJournalStore.getState().loadDemo()
    useAlertsStore.getState().loadDemo()
    useCollaborationStore.getState().loadDemo()
    useDoctorStore.getState().loadDemo()
    usePrenatalStore.getState().loadDemo()
    void realtime.connect()
  } else {
    void realtime.disconnect()
    realtime.setDataSourceType('ble')
    realtime.setRiskEngineMode('remote')
    usePatientJournalStore.getState().reset()
    useAlertsStore.getState().reset()
    useCollaborationStore.getState().reset()
    useDoctorStore.getState().reset()
    usePrenatalStore.getState().reset()
  }
}
