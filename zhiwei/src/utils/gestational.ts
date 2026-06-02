// 孕周计算工具
// 唯一真相来源是 dueDate（预产期）。所有"孕 X 周 + Y 天 / 距预产期还有 …"均由此与真实当前时间推导，
// 禁止任何组件硬编码孕周。

const DAY_MS = 24 * 60 * 60 * 1000
/** 足月妊娠总天数（自末次月经起）：40 周 = 280 天 */
const FULL_TERM_DAYS = 280

export interface GestationalAge {
  totalDays: number // 当前孕龄（天）
  weeks: number
  days: number
  daysUntilDue: number // 距预产期天数（可为负，表示已过预产期）
}

/**
 * 由预产期与当前时间计算孕龄。
 * @param dueDate 预产期 Unix ms
 * @param now 当前时间 Unix ms（默认 Date.now，便于测试注入）
 */
export const computeGestationalAge = (dueDate: number, now: number = Date.now()): GestationalAge => {
  const daysUntilDue = Math.round((dueDate - now) / DAY_MS)
  const totalDays = Math.max(0, FULL_TERM_DAYS - daysUntilDue)
  return {
    totalDays,
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
    daysUntilDue
  }
}

/** "孕 32 周 + 3 天" */
export const formatGestationalAge = (age: GestationalAge): string =>
  `孕 ${age.weeks} 周 + ${age.days} 天`

/** "距离预产期还有 7 周 + 4 天" / "已过预产期 X 天" */
export const formatDaysUntilDue = (age: GestationalAge): string => {
  if (age.daysUntilDue < 0) return `已过预产期 ${Math.abs(age.daysUntilDue)} 天`
  const w = Math.floor(age.daysUntilDue / 7)
  const d = age.daysUntilDue % 7
  return `距离预产期还有 ${w} 周 + ${d} 天`
}
