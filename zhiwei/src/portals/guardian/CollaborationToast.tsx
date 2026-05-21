interface CollaborationToastProps {
  message: string
}

export const CollaborationToast = ({ message }: CollaborationToastProps) => {
  return <div className="rounded-xl bg-[var(--bg-1)] p-3 text-xs text-slate-300">{message}</div>
}
