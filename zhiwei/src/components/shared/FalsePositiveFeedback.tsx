interface FalsePositiveFeedbackProps {
  onFeedback?: (reason: string) => void
}

export const FalsePositiveFeedback = ({ onFeedback }: FalsePositiveFeedbackProps) => {
  return (
    <button
      type="button"
      onClick={() => onFeedback?.('false_positive')}
      className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300"
    >
      这次预警不准，提交反馈
    </button>
  )
}
