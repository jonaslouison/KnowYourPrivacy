import { defineStore } from 'pinia'
import { quizQuestions, recommendations, QuizQuestion } from '../data/questions'
import {
  DeviceSelectionId,
  DeviceSelectionOption,
  DeviceType,
  DEVICE_FLOW_ORDER,
  DEVICE_SELECTION_MAP,
  DEVICE_SELECTION_OPTIONS
} from '../data/devices'
import {
  getServiceByAnswerValue,
  getCategoryIdFromQuestionId
} from '../data/wiki'
import {
  encryptData,
  downloadEncryptedFile,
  readEncryptedFile
} from '../utils/crypto'

export const THREAT_QUESTION_IDS = [
  'threat-surveillance',
  'threat-fingerprinting',
  'threat-government',
  'threat-data-breaches',
  'threat-identity-theft'
]

const THREAT_SPECTRUM = [
  { level: 1, label: 'Normie', description: 'You prioritize convenience and are just starting to learn about tracking.' },
  { level: 2, label: 'Aware', description: 'You notice tracking but still lean on defaults for daily tasks.' },
  { level: 3, label: 'Activist', description: 'You actively harden your stack and value consistent tooling.' },
  { level: 4, label: 'Ghost', description: 'Every connection is treated as a risk and you prefer air-gapped controls.' }
]

const TIER_SCORE_MAP: Record<ThreatTierId, number> = {
  high: 100,
  medium: 65,
  low: 35,
  none: 0
}

export const THREAT_TIER_ORDER = ['high', 'medium', 'low', 'none'] as const
export type ThreatTierId = (typeof THREAT_TIER_ORDER)[number]
export const THREAT_TIER_LABELS: Record<ThreatTierId, string> = {
  high: 'High Concern',
  medium: 'Moderate Concern',
  low: 'Lower Concern',
  none: 'No Concern'
}

export const THREAT_CATALOG: Array<{ id: string; label: string }> = THREAT_QUESTION_IDS.map((questionId) => {
  const question = quizQuestions.find((entry) => entry.id === questionId)
  const label = question?.options.find((option) => option.threat)?.threat
  return {
    id: questionId,
    label: label ?? question?.question ?? questionId
  }
})

const DEVICE_TYPES: DeviceType[] = DEVICE_FLOW_ORDER

const DEVICE_SETUP_CONFIG: Record<DeviceType, Array<{ questionId: string; label: string }>> = {
  pc: [
    { questionId: 'os-desktop', label: 'Operating System' },
    { questionId: 'browser-desktop', label: 'Web Browser' },
    { questionId: 'search-engine', label: 'Search Engine' }
  ],
  phone: [
    { questionId: 'os-mobile', label: 'Operating System' },
    { questionId: 'browser-mobile', label: 'Web Browser' },
    { questionId: 'search-engine', label: 'Search Engine' }
  ],
  tablet: [
    { questionId: 'os-tablet', label: 'Operating System' },
    { questionId: 'browser-mobile', label: 'Web Browser' },
    { questionId: 'search-engine', label: 'Search Engine' }
  ]
}

const mapScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score > 0) return 'Danger'
  return 'Pending'
}

const mapScoreClass = (score: number): 'good' | 'medium' | 'poor' => {
  if (score >= 80) return 'good'
  if (score >= 60) return 'medium'
  return 'poor'
}

const mapThreatSeverity = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= 80) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export interface Answer {
  questionId: string
  answer: string | string[]
}

export interface AppCategory {
  name: string
  icon: string
  questionId: string
  currentApp: string
  currentAppId: string
  recommendedApp: string
  recommendedAppId: string
  score: string
  scoreClass: 'good' | 'medium' | 'poor'
  scoreValue: number
  recommendations: string[]
}

export interface DeviceRow {
  questionId: string
  label: string
  currentApp: string
  scoreValue: number
  scoreLabel: string
  scoreClass: 'good' | 'medium' | 'poor'
  recommendations: string[]
}

export interface ThreatEntry {
  questionId: string
  label: string
  score: number
  severity: 'high' | 'medium' | 'low'
}

export interface QuizState {
  questions: QuizQuestion[]
  answers: Answer[]
  isCompleted: boolean
  currentQuestionIndex: number
  isLoadedFromFile: boolean
  manualThreatLevel: number
  manualOverride: boolean
}

export interface ExportData {
  _format: 'knowyourprivacy-v1'
  answers: Answer[]
  isCompleted: boolean
  currentQuestionIndex: number
  exportedAt: string
}

export type QuizSectionKey = DeviceType | 'general' | 'threat' | 'priorities' | 'device-selection'

export interface QuizFlowItem {
  question: QuizQuestion
  section: QuizSectionKey
}

const normalizeAnswerValue = (value?: string | string[] | null): string[] => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const getPrimaryValue = (value?: string | string[]): string | undefined => {
  return normalizeAnswerValue(value)[0]
}

export const formatThreatTierEntry = (tier: ThreatTierId, label: string): string => `${tier}::${label}`

const parseThreatTierEntry = (value: string): { tier: ThreatTierId; label: string } | null => {
  if (!value.includes('::')) return null
  const [tier, ...parts] = value.split('::')
  if (!tier || !parts.length) return null
  if (!THREAT_TIER_ORDER.includes(tier as ThreatTierId)) return null
  const label = parts.join('::')
  return { tier: tier as ThreatTierId, label }
}

export const parseThreatTierAnswerValue = (value?: string | string[] | null): Record<ThreatTierId, string[]> => {
  const entries = createEmptyTierAssignments()
  const normalized = normalizeAnswerValue(value)
  normalized.forEach((item) => {
    const parsed = parseThreatTierEntry(item)
    if (!parsed) return
    entries[parsed.tier].push(parsed.label)
  })
  return entries
}

const createEmptyTierAssignments = (): Record<ThreatTierId, string[]> => {
  return THREAT_TIER_ORDER.reduce((acc, tier) => {
    acc[tier] = []
    return acc
  }, {} as Record<ThreatTierId, string[]>)
}

const getThreatTierAssignments = (state: QuizState): Record<ThreatTierId, string[]> => {
  const answer = state.answers.find((entry) => entry.questionId === 'threat-priorities')
  return parseThreatTierAnswerValue(answer?.answer)
}

const getDeviceSelectionAnswer = (state: QuizState): DeviceSelectionId[] => {
  const entry = state.answers.find((answer) => answer.questionId === 'device-selection')
  return normalizeAnswerValue(entry?.answer) as DeviceSelectionId[]
}

const calculateNormalizedThreatScore = (state: QuizState): number => {
  const entries = getThreatEntriesFromState(state)
  if (!entries.length) return 0
  const sum = entries.reduce((acc, entry) => acc + entry.score, 0)
  return sum / (entries.length * 100)
}

const resolveComputedThreatLevel = (state: QuizState): number => {
  if (state.answers.length === 0) return 1
  const normalized = calculateNormalizedThreatScore(state)
  if (normalized >= 0.75) return 4
  if (normalized >= 0.5) return 3
  if (normalized >= 0.25) return 2
  return 1
}

const buildDeviceRows = (device: DeviceType, state: QuizState): DeviceRow[] => {
  const config = DEVICE_SETUP_CONFIG[device] || []
  return config.map((item) => {
    const answer = state.answers.find((a) => a.questionId === item.questionId)
    const question = state.questions.find((q) => q.id === item.questionId)
    const selectedValue = getPrimaryValue(answer?.answer)
    const option = question?.options.find((opt) => opt.value === selectedValue)
    const score = option?.score ?? 0
    return {
      questionId: item.questionId,
      label: item.label,
      currentApp: option?.label ?? 'Awaiting response',
      scoreValue: score,
      scoreLabel: mapScoreLabel(score),
      scoreClass: mapScoreClass(score),
      recommendations: selectedValue
        ? recommendations[item.questionId]?.[selectedValue] ?? []
        : []
    }
  })
}

const computeDeviceRating = (device: DeviceType, state: QuizState): number => {
  const rows = buildDeviceRows(device, state)
  const answeredRows = rows.filter((row) => row.scoreValue > 0)
  if (!answeredRows.length) return 0
  const sum = answeredRows.reduce((acc, row) => acc + row.scoreValue, 0)
  return sum / answeredRows.length
}

const computeDeviceRatingNormalized = (device: DeviceType, state: QuizState): number => {
  const rating = computeDeviceRating(device, state)
  return Math.round((rating / 25) * 10) / 10
}

export const QUIZ_SECTION_LABELS: Record<QuizSectionKey, string> = {
  'device-selection': 'Device Setup',
  pc: 'PC Environment',
  phone: 'Phone Environment',
  tablet: 'Tablet Environment',
  general: 'App Usage',
  threat: 'Threat Model',
  priorities: 'Threat Priorities'
}

const matchesDeviceContext = (question: QuizQuestion, device: DeviceType): boolean => {
  if (!question.device) return false
  if (question.device === device) return true
  if (question.device === 'mobile' && (device === 'phone' || device === 'tablet')) return true
  return false
}

const calculatePrivacyScoreNormalized = (state: QuizState): number => {
  const total = DEVICE_TYPES.reduce((acc, device) => acc + computeDeviceRatingNormalized(device, state), 0)
  if (!DEVICE_TYPES.length) return 0
  return Math.round((total / DEVICE_TYPES.length) * 10) / 10
}

const getSelectedDeviceTypes = (state: QuizState): DeviceType[] => {
  const selectionValues = getDeviceSelectionAnswer(state)
  if (!selectionValues.length) return []
  const selectedDevices = selectionValues
    .map((value) => DEVICE_SELECTION_MAP[value])
    .filter((device): device is DeviceType => Boolean(device))
  if (!selectedDevices.length) return []
  const deduped = Array.from(new Set(selectedDevices))
  return DEVICE_FLOW_ORDER.filter((device) => deduped.includes(device))
}

const buildQuizFlow = (state: QuizState): QuizFlowItem[] => {
  const selectedDevices = getSelectedDeviceTypes(state)
  const flow: QuizFlowItem[] = []
  const visited = new Set<string>()

  const deviceSelectionQuestion = state.questions.find((question) => question.id === 'device-selection')
  if (deviceSelectionQuestion) {
    flow.push({ question: deviceSelectionQuestion, section: 'device-selection' })
    visited.add(deviceSelectionQuestion.id)
  }

  const orderedDevices = DEVICE_FLOW_ORDER.filter((device) => selectedDevices.includes(device))
  orderedDevices.forEach((device) => {
    state.questions.forEach((question) => {
      if (visited.has(question.id)) return
      if (matchesDeviceContext(question, device)) {
        flow.push({ question, section: device })
        visited.add(question.id)
      }
    })
  })

  const generalQuestions = state.questions.filter((question) => {
    if (visited.has(question.id)) return false
    if (THREAT_QUESTION_IDS.includes(question.id)) return false
    if (question.id === 'threat-priorities') return false
    if (question.device) return false
    return true
  })
  generalQuestions.forEach((question) => {
    flow.push({ question, section: 'general' })
    visited.add(question.id)
  })

  const priorityQuestion = state.questions.find((entry) => entry.id === 'threat-priorities')
  if (priorityQuestion) {
    flow.push({ question: priorityQuestion, section: 'priorities' })
    visited.add(priorityQuestion.id)
  }

  return flow
}

const getThreatEntriesFromState = (state: QuizState): ThreatEntry[] => {
  const assignments = getThreatTierAssignments(state)
  const entries = THREAT_CATALOG.map((catalog) => {
    const tier = THREAT_TIER_ORDER.find((tierId) => assignments[tierId].includes(catalog.label)) ?? 'none'
    const score = TIER_SCORE_MAP[tier]
    return {
      questionId: catalog.id,
      label: catalog.label,
      score,
      severity: mapThreatSeverity(score)
    }
  })
  return entries.sort((a, b) => b.score - a.score)
}

const getOrderedThreatEntriesFromState = (state: QuizState): ThreatEntry[] => {
  const baseEntries = getThreatEntriesFromState(state)
  const assignments = getThreatTierAssignments(state)
  const orderedLabels = THREAT_TIER_ORDER.flatMap((tier) => assignments[tier])
  if (!orderedLabels.length) return baseEntries
  const ordered = orderedLabels
    .map((label) => baseEntries.find((entry) => entry.label === label))
    .filter((entry): entry is ThreatEntry => Boolean(entry))
  const remainder = baseEntries.filter((entry) => !ordered.some((orderedEntry) => orderedEntry.label === entry.label))
  return [...ordered, ...remainder]
}

export const useQuizStore = defineStore({
  id: 'quiz',
  state: (): QuizState => ({
    questions: quizQuestions,
    answers: [],
    isCompleted: false,
    currentQuestionIndex: 0,
    isLoadedFromFile: false,
    manualThreatLevel: 1,
    manualOverride: false
  }),

  getters: {
    /**
     * Get answer for a specific question
     */
    getAnswer: (state) => (questionId: string): string | string[] | null => {
      const answer = state.answers.find((a) => a.questionId === questionId)
      return answer ? answer.answer : null
    },

    /**
     * Calculate overall privacy score (0-100)
     */
    calculatePrivacyScore: (state) => (): number => {
      if (state.answers.length === 0) return 0

      let totalScore = 0
      let totalWeight = 0
      const ignoredQuestions = ['device-selection', 'threat-priorities']

      state.answers.forEach((answer) => {
        if (ignoredQuestions.includes(answer.questionId)) return
        const question = state.questions.find((q) => q.id === answer.questionId)
        if (!question) return
        const values = normalizeAnswerValue(answer.answer)
        values.forEach((value) => {
          const option = question.options.find((o) => o.value === value)
          if (option && option.score !== undefined) {
            totalScore += option.score
            totalWeight += 100
          }
        })
      })

      return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0
    },

    /**
     * Get user's threat model based on answers
     */
    getThreatModel: (state) => (): string[] => {
      const threats: string[] = []

      state.answers.forEach((answer) => {
        const question = state.questions.find((q) => q.id === answer.questionId)
        if (question) {
          const option = question.options.find((o) => o.value === getPrimaryValue(answer.answer))
          if (option && option.threat && !threats.includes(option.threat)) {
            threats.push(option.threat)
          }
        }
      })

      return threats
    },

    /**
     * Get app categories with current apps and recommendations
     */
    getAppCategories: (state) => (): AppCategory[] => {
      const categories: AppCategory[] = []

      // Helper to find the best recommended service from wiki
      const findRecommendedService = (questionId: string, recList: string[]): { name: string; id: string } => {
        if (!recList.length) return { name: '', id: '' }
        const firstRec = recList[0]
        // Skip non-actionable recommendations
        if (firstRec.includes('!') || firstRec.toLowerCase().includes('consider') || firstRec.toLowerCase().includes('already') || firstRec.toLowerCase().includes('perfect') || firstRec.toLowerCase().includes('great')) {
          return { name: '', id: '' }
        }
        const categoryId = getCategoryIdFromQuestionId(questionId)
        if (!categoryId) return { name: firstRec, id: '' }
        const service = getServiceByAnswerValue(categoryId, firstRec)
        return service ? { name: service.name, id: service.id } : { name: firstRec, id: '' }
      }

      // Category definitions for cleaner code
      const categoryDefs = [
        { questionId: 'browser-desktop', name: 'Web Browser (Desktop)', icon: '🌐' },
        { questionId: 'email-provider', name: 'Email Provider', icon: '✉️' },
        { questionId: 'search-engine', name: 'Search Engine', icon: '🔍' },
        { questionId: 'messaging-app', name: 'Messaging App', icon: '💬' },
        { questionId: 'cloud-storage', name: 'Cloud Storage', icon: '☁️' },
        { questionId: 'password-manager', name: 'Password Manager', icon: '🔑' },
        { questionId: 'vpn-usage', name: 'VPN Service', icon: '🛡️' }
      ]

      for (const def of categoryDefs) {
        const answer = state.answers.find((a) => a.questionId === def.questionId)
        if (!answer) continue

        const question = state.questions.find((q) => q.id === def.questionId)
        const answerValue = getPrimaryValue(answer.answer)
        const option = answerValue ? question?.options.find((o) => o.value === answerValue) : undefined
        const score = option?.score || 0
        const recommendationList = answerValue
          ? recommendations[def.questionId]?.[answerValue] ?? []
          : []
        
        const recommended = findRecommendedService(def.questionId, recommendationList)
        const categoryId = getCategoryIdFromQuestionId(def.questionId)
        const currentService = categoryId ? getServiceByAnswerValue(categoryId, answerValue || '') : undefined

        categories.push({
          name: def.name,
          icon: def.icon,
          questionId: def.questionId,
          currentApp: option?.label || 'Unknown',
          currentAppId: currentService?.id || answerValue || '',
          recommendedApp: recommended.name,
          recommendedAppId: recommended.id,
          score: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Danger',
          scoreClass: score >= 80 ? 'good' : score >= 60 ? 'medium' : 'poor',
          scoreValue: score,
          recommendations: recommendationList
        })
      }

      return categories
    },
    selectedDeviceSelections: (state): DeviceSelectionOption[] => {
      const selectionValues = getDeviceSelectionAnswer(state)
      if (!selectionValues.length) return []
      return DEVICE_SELECTION_OPTIONS.filter((option) => selectionValues.includes(option.id))
    },
    selectedDeviceTypes: (state): DeviceType[] => getSelectedDeviceTypes(state),
    quizFlow: (state): QuizFlowItem[] => buildQuizFlow(state),
    normalizedThreatScore: (state) => calculateNormalizedThreatScore(state),
    computedThreatLevel: (state) => resolveComputedThreatLevel(state),
    computedThreatSpectrumInfo: (state) => THREAT_SPECTRUM[resolveComputedThreatLevel(state) - 1] ?? THREAT_SPECTRUM[0],
    displayThreatLevel: (state) => state.manualThreatLevel,
    displayThreatSpectrumInfo: (state) => THREAT_SPECTRUM[state.manualThreatLevel - 1] ?? THREAT_SPECTRUM[0],
    threatSpectrumOptions: () => THREAT_SPECTRUM,
    threatEntries: (state): ThreatEntry[] => getThreatEntriesFromState(state),
    orderedThreatEntries: (state): ThreatEntry[] => getOrderedThreatEntriesFromState(state),
    getDeviceSetup: (state) => (device: DeviceType): DeviceRow[] => buildDeviceRows(device, state),
    getDeviceRating: (state) => (device: DeviceType): number => computeDeviceRating(device, state),
    getDeviceRatingNormalized: (state) => (device: DeviceType): number => computeDeviceRatingNormalized(device, state),
    privacyScoreNormalized: (state) => calculatePrivacyScoreNormalized(state)
  },

  actions: {
    /**
     * Save an answer to a question
     */
    saveAnswer(payload: Answer): void {
      const existingIndex = this.answers.findIndex((a) => a.questionId === payload.questionId)

      if (existingIndex !== -1) {
        this.answers[existingIndex] = payload
      } else {
        this.answers.push(payload)
      }

      if (!this.manualOverride) {
        this.manualThreatLevel = this.computedThreatLevel
      }
    },

    /**
     * Mark quiz as completed
     */
    completeQuiz(): void {
      this.isCompleted = true
      // Sync manualThreatLevel with computedThreatLevel when quiz is completed
      if (!this.manualOverride) {
        this.manualThreatLevel = this.computedThreatLevel
      }
    },

    /**
     * Reset all quiz data
     */
    resetQuiz(): void {
      this.answers = []
      this.isCompleted = false
      this.currentQuestionIndex = 0
      this.isLoadedFromFile = false
      this.manualThreatLevel = 1
      this.manualOverride = false
    },

    setThreatOrder(order: string[]): void {
      const existingIndex = this.answers.findIndex((entry) => entry.questionId === 'threat-priorities')
      const payload: Answer = {
        questionId: 'threat-priorities',
        answer: order
      }
      if (existingIndex !== -1) {
        this.answers[existingIndex] = payload
      } else {
        this.answers.push(payload)
      }

      // Sync manualThreatLevel with computedThreatLevel when threat order changes
      if (!this.manualOverride) {
        this.manualThreatLevel = this.computedThreatLevel
      }
    },

    setManualThreatLevel(level: number): void {
      const clamped = Math.min(Math.max(level, 1), 4)
      this.manualThreatLevel = clamped
      this.manualOverride = clamped !== this.computedThreatLevel
    },

    resetManualThreatLevel(): void {
      this.manualThreatLevel = this.computedThreatLevel
      this.manualOverride = false
    },

    /**
     * Export encrypted data to file
     */
    async exportEncryptedData(password: string): Promise<boolean> {
      const data: ExportData = {
        _format: 'knowyourprivacy-v1',
        answers: this.answers,
        isCompleted: this.isCompleted,
        currentQuestionIndex: this.currentQuestionIndex,
        exportedAt: new Date().toISOString()
      }

      const encryptedString = await encryptData(data, password)
      return downloadEncryptedFile(encryptedString)
    },

    /**
     * Import encrypted data from file
     */
    async importEncryptedData(file: File, password: string): Promise<void> {
      const data = await readEncryptedFile(file, password)

      // Validate the decrypted data has correct format identifier
      if (!data._format || data._format !== 'knowyourprivacy-v1') {
        throw new Error('Invalid file: This is not a Know Your Privacy export file. Please select a valid export file.')
      }

      if (!data.answers || !Array.isArray(data.answers)) {
        throw new Error('Corrupted file: Invalid data structure in export file.')
      }

      this.answers = data.answers
      this.isCompleted = data.isCompleted || false
      this.currentQuestionIndex = data.currentQuestionIndex || 0
      this.isLoadedFromFile = true
      this.manualThreatLevel = this.computedThreatLevel
      this.manualOverride = false
    }
  }
})
