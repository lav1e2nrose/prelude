import type { EHGFrame, FeatureContribution, RiskExplanation } from '../types/signal'

export class ExplainabilityEngine {
  private modelVersion = 'EHG-Net-v2.3.1'

  generateExplanation(frame: EHGFrame): RiskExplanation {
    const confidence = Math.min(0.98, 0.55 + frame.electrodeQuality / 200)
    const featureContributions: FeatureContribution[] = [
      {
        featureName: 'contractionsPerHour',
        displayName: '宫缩频率',
        currentValue: 3.2,
        baselineValue: 1.6,
        contribution: 0.24,
        unit: '次/h'
      },
      {
        featureName: 'maternalHeartRate',
        displayName: '母体心率',
        currentValue: frame.maternalHR,
        baselineValue: 78,
        contribution: 0.1,
        unit: 'bpm'
      }
    ]

    return {
      modelVersion: this.modelVersion,
      confidence,
      confidenceInterval: [Math.max(0, confidence - 0.12), Math.min(1, confidence + 0.12)],
      featureContributions,
      oodScore: 0.12,
      similarPatients: [
        {
          anonymizedId: 'PT-0412',
          similarityScore: 0.86,
          gestationalWeekAtMeasurement: 32.4,
          actualOutcome: 'preterm_7d',
          outcomeNote: '72 小时内转入产科监护'
        }
      ],
      counterfactuals: [
        {
          scenario: '如果宫缩频率降至 2 次/h',
          conditionChanges: { contractionsPerHour: 2 },
          resultingRiskScore: 0.42,
          resultingRiskChange: -0.18,
          actionability: 'modifiable'
        }
      ],
      knownLimitations: ['高体位变化场景的误报率偏高']
    }
  }
}
