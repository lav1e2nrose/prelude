const logs = [
  { time: '08:42', duration: '42s', intensity: '中等' },
  { time: '10:15', duration: '55s', intensity: '偏强' },
  { time: '12:03', duration: '38s', intensity: '轻度' }
]

export const ContractionLog = () => {
  return (
    <div className="rounded-2xl bg-[var(--bg-1)] p-4">
      <div className="text-sm text-slate-300">今日宫缩记录</div>
      <div className="mt-4 space-y-3">
        {logs.map((log) => (
          <div key={log.time} className="flex items-center justify-between text-sm text-slate-200">
            <span>{log.time}</span>
            <span>{log.duration}</span>
            <span>{log.intensity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
