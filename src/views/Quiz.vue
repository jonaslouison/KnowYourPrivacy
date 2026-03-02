<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseModal from '../components/BaseModal.vue'
import BaseTierlist from '../components/BaseTierlist.vue'
import { useQuizStore,
    QUIZ_SECTION_LABELS,
    THREAT_CATALOG,
    THREAT_TIER_LABELS,
    THREAT_TIER_ORDER,
    formatThreatTierEntry,
    parseThreatTierAnswerValue,
    type QuizSectionKey,
    type ThreatTierId
} from '../stores/quiz'
import { useTimerStore } from '../stores/timer'
import { showToast } from '../utils/toast'
import { useReloadGuard } from '../composables/useReloadGuard'
import { THREAT_DESCRIPTIONS } from '../data/wiki'

const router = useRouter()
const route = useRoute()
const quizStore = useQuizStore()
const timerStore = useTimerStore()
const { openPasswordModal } = useReloadGuard()

const selectedAnswer = ref<string | string[] | null>(null)
const quizCompleted = ref(false)
const showQuiz = ref(true)
const quizResumedBanner = ref(false)
const showDeleteConfirm = ref(false)
const showRestartConfirm = ref(false)

const questionFlow = computed(() => quizStore.quizFlow)
const flowLength = computed(() => questionFlow.value.length)
const currentFlowIndex = computed(() => {
    if (!flowLength.value) return 0
    return Math.min(quizStore.currentQuestionIndex, flowLength.value - 1)
})
const currentFlowItem = computed(() => questionFlow.value[currentFlowIndex.value])
const currentQuestion = computed(() => currentFlowItem.value?.question ?? quizStore.questions[0])
const currentSectionKey = computed<QuizSectionKey>(() => currentFlowItem.value?.section ?? 'device-selection')
const currentContextLabel = computed(() => QUIZ_SECTION_LABELS[currentSectionKey.value])
const progressPercentage = computed(() => {
    if (!flowLength.value) return 0
    return ((currentFlowIndex.value + 1) / flowLength.value) * 100
})
const isLastQuestion = computed(() => flowLength.value > 0 && currentFlowIndex.value === flowLength.value - 1)
const reviewMode = computed(() => route.query.review === '1')
const quizCardVisible = computed(() => showQuiz.value && (!quizCompleted.value || reviewMode.value))
const isDeviceSelectionQuestion = computed(() => currentQuestion.value.id === 'device-selection')
const isThreatPriorityQuestion = computed(() => currentQuestion.value.id === 'threat-priorities')
const tierlistItems = computed(() =>
    THREAT_CATALOG.map((entry) => ({ id: entry.label, label: entry.label }))
)
const tierDefinitions = THREAT_TIER_ORDER.map((tier) => ({ id: tier, label: THREAT_TIER_LABELS[tier] }))
const threatDescriptions = THREAT_DESCRIPTIONS
const threatModelGuideUrl = 'https://www.privacyguides.org/en/basics/threat-modeling/'
const buildTierAssignmentSnapshot = (source?: Record<ThreatTierId, string[]>) => {
    return THREAT_TIER_ORDER.reduce((acc, tier) => {
        const values = source?.[tier] ?? []
        acc[tier] = [...values]
        return acc
    }, {} as Record<ThreatTierId, string[]>)
}
const tierAssignments = ref<Record<ThreatTierId, string[]>>(buildTierAssignmentSnapshot())
const storedTierAssignments = computed(() => {
    const storedAnswer = quizStore.getAnswer('threat-priorities')
    return parseThreatTierAnswerValue(storedAnswer)
})
watch(
    storedTierAssignments,
    (value) => {
        tierAssignments.value = buildTierAssignmentSnapshot(value)
    },
    { deep: true, immediate: true }
)
const assignedOptionCount = computed(() => THREAT_TIER_ORDER.reduce((total, tier) => total + (tierAssignments.value[tier]?.length ?? 0), 0))
const tierlistComplete = computed(() => tierlistItems.value.length > 0 && assignedOptionCount.value === tierlistItems.value.length)
const canProceed = computed(() => {
    if (isDeviceSelectionQuestion.value) {
        return Array.isArray(selectedAnswer.value) && selectedAnswer.value.length > 0
    }
    if (isThreatPriorityQuestion.value) {
        return tierlistComplete.value
    }
    return Boolean(selectedAnswer.value)
})
const normalizeSelectionArray = (value?: string | string[] | null): string[] => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
}

const loadExistingAnswer = () => {
    const flow = currentFlowItem.value
    if (!flow) return
    const storedAnswer = quizStore.getAnswer(flow.question.id)

    if (flow.question.id === 'device-selection') {
        selectedAnswer.value = normalizeSelectionArray(storedAnswer)
        return
    }

    if (flow.question.id === 'threat-priorities') {
        selectedAnswer.value = null
        tierAssignments.value = buildTierAssignmentSnapshot(storedTierAssignments.value)
        return
    }

    selectedAnswer.value = Array.isArray(storedAnswer) ? storedAnswer[0] ?? null : storedAnswer
}

const selectAnswer = (value: string) => {
    if (isDeviceSelectionQuestion.value) {
        const current = Array.isArray(selectedAnswer.value) ? [...selectedAnswer.value] : []
        const index = current.indexOf(value)
        if (index !== -1) {
            current.splice(index, 1)
        } else {
            current.push(value)
        }
        selectedAnswer.value = current
    } else {
        selectedAnswer.value = value
    }

    if (quizResumedBanner.value) quizResumedBanner.value = false
}

const isOptionSelected = (value: string) => {
    if (isDeviceSelectionQuestion.value) {
        return Array.isArray(selectedAnswer.value) && selectedAnswer.value.includes(value)
    }
    return selectedAnswer.value === value
}

const nextQuestion = () => {
    const flow = currentFlowItem.value
    if (!flow) return
    const questionId = flow.question.id

    if (questionId === 'device-selection') {
        const selections = Array.isArray(selectedAnswer.value) ? selectedAnswer.value : []
        if (!selections.length) return
        quizStore.saveAnswer({
            questionId,
            answer: selections
        })
    } else if (questionId === 'threat-priorities') {
        if (!tierlistComplete.value) return
        const payload = THREAT_TIER_ORDER.flatMap((tier) =>
            (tierAssignments.value[tier] ?? []).map((label) => formatThreatTierEntry(tier, label))
        )
        quizStore.setThreatOrder(payload)
    } else {
        if (!selectedAnswer.value || Array.isArray(selectedAnswer.value)) return
        quizStore.saveAnswer({
            questionId,
            answer: selectedAnswer.value
        })
    }

    if (isLastQuestion.value) {
        quizStore.completeQuiz()
        // Stop quiz timer when quiz is completed
        timerStore.stopQuizTimer()
        quizCompleted.value = true
        showQuiz.value = false
    } else {
        quizStore.currentQuestionIndex++
        loadExistingAnswer()
    }
}

const previousQuestion = () => {
    if (quizStore.currentQuestionIndex > 0) {
        quizStore.currentQuestionIndex--
        loadExistingAnswer()
    }
}

const exportDuringQuiz = () => {
    openPasswordModal()
}

const viewDashboard = () => {
    router.push('/dashboard')
}

const copyQuizTime = async () => {
    const copied = await timerStore.copyQuizTime()
    if (copied) {
        showToast('Quiz time copied to clipboard!', 'success')
    }
}

const confirmRestart = () => {
    quizStore.resetQuiz()
    // Reset and restart quiz timer
    timerStore.resetQuizTimer()
    timerStore.startQuizTimer()
    quizCompleted.value = false
    showQuiz.value = true
    showRestartConfirm.value = false
    loadExistingAnswer()
    showToast('Quiz restarted', 'success')
}

const cancelRestart = () => {
    showRestartConfirm.value = false
}

const confirmDelete = () => {
    quizStore.resetQuiz()
    // Reset both timers on delete
    timerStore.resetQuizTimer()
    timerStore.resetLoadTimer()
    showDeleteConfirm.value = false
    quizCompleted.value = false
    showQuiz.value = true
    showToast('All data deleted successfully', 'success')
    router.push('/')
}

const cancelDelete = () => {
    showDeleteConfirm.value = false
}

watch(
    questionFlow,
    (flow) => {
        if (!flow.length) return
        if (quizStore.currentQuestionIndex > flow.length - 1) {
            quizStore.currentQuestionIndex = Math.max(flow.length - 1, 0)
        }
    },
    { immediate: true }
)

watch(currentFlowItem, () => {
    loadExistingAnswer()
})

onMounted(() => {
    if (quizStore.isCompleted) {
        quizCompleted.value = true
        if (reviewMode.value) {
            showQuiz.value = true
            quizStore.currentQuestionIndex = 0
        } else {
            showQuiz.value = false
        }
    } else {
        quizCompleted.value = false
        showQuiz.value = true
    }

    loadExistingAnswer()

    if (quizStore.isLoadedFromFile && !quizStore.isCompleted) {
        quizResumedBanner.value = true
    }
})
</script>

<template>
    <div class="quiz container">
        <!-- Quiz Header -->
        <div v-if="quizCardVisible" class="quiz-header">
            <div class="quiz-header-top">
                <h1>Privacy Quiz</h1>
                <div class="header-buttons">
                    <BaseButton variant="outline" size="small" @click="showRestartConfirm = true" title="Restart Quiz">
                        🔄 Restart
                    </BaseButton>
                    <BaseButton variant="secondary" size="small" @click="exportDuringQuiz" title="Save Progress">
                        💾 Save Progress
                    </BaseButton>
                    <BaseButton variant="danger" size="small" @click="showDeleteConfirm = true" title="Delete All Data">
                        🗑️ Delete All Data
                    </BaseButton>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
            <p class="progress-text">
                <template v-if="isDeviceSelectionQuestion">Getting Started</template>
                <template v-else>Question {{ currentFlowIndex + 1 }} of {{ flowLength }}</template>
            </p>
        </div>
        <div v-if="quizCardVisible" class="context-card">
            <p class="context-title">{{ currentContextLabel }}</p>
            <p class="context-subtitle">{{ currentQuestion.category }}</p>
        </div>

        <!-- Transient Unfinished Quiz Indicator (only right after resume) -->
        <div v-if="quizResumedBanner" class="info-banner">
            <div class="info-content">
                <span class="info-icon">ℹ️</span>
                <div class="info-text">
                    <strong>Continuing Your Quiz</strong>
                    <p>You're resuming from where you left off. Answer this question to dismiss this notice.</p>
                </div>
            </div>
        </div>

        <!-- Quiz Content -->
        <div v-if="quizCardVisible" class="quiz-content">
            <div class="question-card card">
                <h2>{{ currentQuestion.question }}</h2>
                <p v-if="isDeviceSelectionQuestion" class="question-note">Select every device you rely on right now.</p>

                <div v-if="!isThreatPriorityQuestion" class="options">
                    <BaseButton
                        v-for="option in currentQuestion.options"
                        :key="option.value"
                        variant="ghost"
                        class="option-btn"
                        :class="{ selected: isOptionSelected(option.value) }"
                        @click="selectAnswer(option.value)"
                        type="button"
                    >
                        {{ option.label }}
                    </BaseButton>
                </div>

                <div v-if="isThreatPriorityQuestion" class="tierlist-section">
                    <div class="threat-info-panel">
                        <h3>Understanding the Threats</h3>
                        <p class="threat-info-intro">Drag each threat to the tier that matches your concern level. Here's what each threat means:</p>
                        <div class="threat-descriptions">
                            <div v-for="threat in threatDescriptions" :key="threat.id" class="threat-desc-item">
                                <span class="threat-icon">{{ threat.icon }}</span>
                                <div class="threat-desc-content">
                                    <strong>{{ threat.label }}</strong>
                                    <p>{{ threat.shortDescription }}</p>
                                </div>
                            </div>
                        </div>
                        <a :href="threatModelGuideUrl" target="_blank" rel="noopener noreferrer" class="learn-more-link">
                            📚 Learn more about threat modeling →
                        </a>
                    </div>
                    <BaseTierlist
                        :tiers="tierDefinitions"
                        :items="tierlistItems"
                        v-model:assignments="tierAssignments"
                    />
                </div>

                <div class="quiz-actions">
                    <BaseButton
                        variant="outline"
                        :disabled="quizStore.currentQuestionIndex === 0"
                        @click="previousQuestion"
                    >
                        Previous
                    </BaseButton>
                    <BaseButton variant="primary" :disabled="!canProceed" @click="nextQuestion">
                        {{ isLastQuestion ? 'Finish' : 'Next' }}
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Quiz Completion Screen -->
        <div v-if="quizCompleted && !showQuiz" class="completion-screen">
            <div class="completion-card card">
                <div class="congratulations">
                    <h1>🎉 Congratulations!</h1>
                    <p>You've completed the Privacy Quiz</p>
                    
                    <!-- Quiz Timer Display -->
                    <div v-if="timerStore.quizTimerCompleted" class="quiz-time-display">
                        <span class="time-label">⏱️ Quiz completed in:</span>
                        <span class="time-value">{{ timerStore.quizElapsedFormatted }}</span>
                        <BaseButton variant="ghost" size="small" class="copy-time-btn" @click="copyQuizTime">
                            📋 Copy
                        </BaseButton>
                    </div>
                    
                    <p class="completion-message">
                        You now have a personalized privacy score and recommendations for your digital security.
                    </p>
                    <BaseButton variant="primary" size="medium" @click="viewDashboard">
                        📊 View Your Dashboard
                    </BaseButton>
                </div>
            </div>
        </div>

        <BaseModal v-model:visible="showRestartConfirm" title="Restart Quiz?">
            <p>This will clear your current progress. Continue?</p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelRestart">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmRestart">Restart</BaseButton>
            </template>
        </BaseModal>

        <BaseModal v-model:visible="showDeleteConfirm" title="Delete All Data?">
            <p>All answers will be permanently removed. Are you sure?</p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelDelete">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmDelete">Delete</BaseButton>
            </template>
        </BaseModal>

    </div>
</template>

<style scoped>
.quiz {
    max-width: 800px;
    margin: 0 auto;
    padding-top: 2rem;
}

.quiz-header {
    margin-bottom: 1.25rem;
}

.context-card {
    border-radius: 14px;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, rgba(24, 40, 255, 0.12), rgba(118, 87, 255, 0.15));
    margin-bottom: 1.25rem;
}

.context-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
}

.context-subtitle {
    margin: 0.35rem 0 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.quiz-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.quiz-header h1 {
    color: var(--primary-color);
    margin: 0;
    font-size: 1.8rem;
}

.header-buttons {
    display: flex;
    gap: 0.5rem;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--border-color);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    transition: width 0.3s ease;
}

.progress-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.info-banner {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    border-left: 4px solid var(--primary-color);
    border-radius: 6px;
}

.info-content {
    display: flex;
    gap: 1rem;
}

.info-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-text {
    flex: 1;
}

.info-text strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: 0.25rem;
}

.info-text p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

.question-card {
    padding: 2.5rem;
}

.question-card h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.question-note {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

@media (max-width: 640px) {
    .options {
        grid-template-columns: 1fr;
    }
}

.header-buttons .base-button {
    white-space: nowrap;
}

.option-btn {
    padding: 1rem 1.5rem;
    border: 2px solid var(--border-color);
    background: var(--card-bg);
    border-radius: 8px;
    text-align: left;
    font-size: 1rem;
    transition: all 0.2s;
    cursor: pointer;
}

.option-btn:hover {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.option-btn.selected {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
    font-weight: 500;
}

.quiz-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.quiz-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.tierlist-section {
    margin-top: 1.5rem;
}

.threat-info-panel {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
}

.threat-info-panel h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: var(--primary-color);
}

.threat-info-intro {
    color: var(--text-secondary);
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
}

.threat-descriptions {
    display: grid;
    gap: 0.75rem;
}

.threat-desc-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--bg-color);
    border-radius: 8px;
}

.threat-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
}

.threat-desc-content {
    flex: 1;
    min-width: 0;
}

.threat-desc-content strong {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--text-primary);
}

.threat-desc-content p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.learn-more-link {
    display: inline-block;
    margin-top: 1rem;
    color: var(--primary-color);
    font-size: 0.9rem;
    text-decoration: none;
}

.learn-more-link:hover {
    text-decoration: underline;
}

.completion-screen {
    padding-top: 4rem;
    text-align: center;
}

.completion-card {
    padding: 4rem 2rem;
    text-align: center;
}

.congratulations {
    animation: slideUp 0.5s ease-out;
}

.congratulations h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.congratulations p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.completion-message {
    color: var(--text-primary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.quiz-time-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    background: color-mix(in srgb, var(--success-color) 10%, transparent);
    border-radius: 12px;
    border: 2px solid var(--success-color);
}

.quiz-time-display .time-label {
    color: var(--text-secondary);
    font-size: 0.95rem;
}

.quiz-time-display .time-value {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--success-color);
}

.quiz-time-display .copy-time-btn {
    margin-left: 0.5rem;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
    .quiz-header-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .quiz-header h1 {
        font-size: 1.5rem;
    }

    .header-buttons {
        width: 100%;
        flex-wrap: wrap;
    }

    .header-buttons button {
        flex: 1;
        min-width: 0;
        font-size: 0.85rem;
    }

    .question-card {
        padding: 1.5rem;
    }

    .question-card h2 {
        font-size: 1.25rem;
        line-height: 1.3;
    }

    .options {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        max-height: calc(100vh - 450px);
        overflow-y: auto;
        padding-right: 0.25rem;
    }

    .quiz-actions {
        position: sticky;
        bottom: 0;
        background: var(--card-bg);
        padding: 1rem 0 0;
        margin: 0 -1.5rem -1.5rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-color);
        z-index: 10;
    }

    .quiz-actions button {
        flex: 1;
    }

    .completion-card {
        padding: 2rem 1rem;
    }

    .congratulations h1 {
        font-size: 2rem;
    }

    .quiz-time-display {
        flex-direction: column;
        gap: 0.5rem;
    }

    .threat-descriptions {
        gap: 0.5rem;
    }

    .threat-desc-item {
        padding: 0.5rem;
    }

    .info-content {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style>
