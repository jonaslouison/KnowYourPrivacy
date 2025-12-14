<template>
    <div class="dashboard container">
        <div v-if="!hasAnswers" class="empty-state card">
            <h2>No Quiz Data</h2>
            <p>You haven't started the quiz yet. Begin to see your privacy dashboard.</p>
            <div class="action-buttons">
                <BaseButton variant="primary" @click="router.push('/quiz')">Start Quiz</BaseButton>
                <BaseButton variant="secondary" @click="loadDashboard">📥 Load Saved Data</BaseButton>
            </div>
        </div>

        <div v-else-if="shouldContinueQuiz" class="continue-state card">
            <h2>Continue Your Quiz</h2>
            <p>You have unfinished answers. Resume to pick up where you left off.</p>
            <p class="progress-hint">Current position: Question {{ quizStore.currentQuestionIndex + 1 }} of {{ quizStore.questions.length }}</p>
            <div class="action-buttons">
                <BaseButton variant="primary" @click="router.push('/quiz')">➡️ Continue Quiz</BaseButton>
                <BaseButton variant="secondary" @click="loadDashboard">📥 Load a Different File</BaseButton>
            </div>
        </div>

        <div v-else>
            <div v-if="hasUnsavedChanges" class="warning-banner">
                <div class="warning-content">
                    <span class="warning-icon">⚠️</span>
                    <div class="warning-text">
                        <strong>Unsaved Data</strong>
                        <p>Your quiz results haven't been exported yet. Export them to save your progress!</p>
                    </div>
                    <BaseButton variant="primary" size="small" @click="exportData">
                        💾 Export Now
                    </BaseButton>
                </div>
            </div>

            <div v-if="quizStore.isLoadedFromFile" class="success-banner">
                <div class="success-content">
                    <span class="success-icon">✅</span>
                    <div class="success-text">
                        <strong>Your Quiz is currently saved in this file</strong>
                        <p>Your progress and results are securely stored.</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-metrics">
                <section class="threat-model-panel card">
                    <div class="panel-heading">
                        <div class="heading-main">
                            <div>
                                <p class="eyebrow">Threat Model</p>
                                <div class="heading-title">
                                    <h2>{{ displayThreatSpectrumLabel }}</h2>
                                    <span v-if="manualOverride" class="manual-tag">Manual</span>
                                </div>
                                <p class="subtext">{{ displayThreatSpectrumDescription }}</p>
                            </div>
                            <div class="heading-select-wrapper">
                                <label for="threat-level-select">Threat level</label>
                                <select id="threat-level-select" :value="displayThreatLevel" @change="handleThreatLevelChange">
                                    <option v-for="option in threatLevelOptions" :key="option.level" :value="option.level">
                                        Level {{ option.level }} · {{ option.label }}
                                    </option>
                                </select>
                                <button type="button" class="reset-button" @click="resetThreatLevel" :disabled="!manualOverride">
                                    reset
                                </button>
                            </div>
                        </div>
                        <div class="awareness-display">
                            <div class="score-display compact">
                                <div class="score-value">{{ displayThreatLevel }}</div>
                                <div class="score-denominator">/ 4</div>
                            </div>
                            <p class="awareness-label">Awareness meter</p>
                        </div>
                        <p class="meta">Computed level · {{ quizStore.computedThreatLevel }} · {{ computedThreatSpectrumInfo.label }}</p>
                    </div>
                    <div class="threat-body">
                        <div class="threat-chips">
                            <div
                                v-for="entry in threatEntries"
                                :key="entry.questionId"
                                class="threat-entry-row"
                            >
                                <span class="chip" :class="entry.severity">
                                    {{ entry.label }}
                                </span>
                                <BaseButton variant="ghost" size="small" @click="jumpToThreatPriorities">
                                    ✏️ Edit
                                </BaseButton>
                            </div>
                            <p v-if="!threatEntries.length" class="muted">Answer the threat model questions to surface your biggest risks.</p>
                        </div>
                        <div class="priority-actions">
                            <h3>Priority actions</h3>
                            <ul>
                                <li v-for="recItem in actionableRecommendations" :key="recItem.name">
                                    <div class="priority-label">
                                        <span class="icon">{{ recItem.icon }}</span>
                                        <div>
                                            <strong>{{ recItem.name }}</strong>
                                            <small>{{ recItem.currentApp }}</small>
                                        </div>
                                    </div>
                                    <p class="recommendation">{{ recItem.recommendations[0] }}</p>
                                </li>
                                <li v-if="!actionableRecommendations.length" class="muted">You've already matched every core app to your threat model.</li>
                            </ul>
                        </div>
                    </div>
                    <div class="panel-actions compact">
                        <BaseButton variant="secondary" size="small" @click="reviewQuiz">Review Quiz Answers</BaseButton>
                    </div>
                </section>

                <section class="score-panel card">
                    <div class="panel-heading">
                        <p class="eyebrow">Privacy Score</p>
                        <h2>{{ privacyScoreDisplay }}</h2>
                        <p class="subtext">Average of your device ratings so the score reflects device-specific privacy.</p>
                    </div>
                    <div class="score-display compact">
                        <div class="score-value">{{ privacyScoreDisplay }}</div>
                        <div class="score-denominator">/ 4</div>
                    </div>
                    <p class="score-description">{{ scoreDescription }}</p>
                </section>
            </div>

            <section class="devices-panel card">
                <div class="panel-heading">
                    <p class="eyebrow">Your Devices</p>
                    <h2>Focus on one device</h2>
                </div>
                <div class="device-switcher">
                    <BaseButton
                        v-for="device in deviceTypes"
                        :key="device"
                        variant="ghost"
                        size="small"
                        :class="{ active: selectedDevice === device }"
                        @click="selectDevice(device)"
                    >
                        {{ device === 'pc' ? 'Desktop' : device === 'phone' ? 'Phone' : 'Tablet' }}
                    </BaseButton>
                </div>
                <p class="muted">Each table below shows the current apps you use for that device. Ratings feed into the overall privacy score.</p>
            </section>

            <section class="device-setup card">
                <div class="panel-heading">
                    <h2>Your {{ deviceLabel }} Setup</h2>
                </div>
                <div class="setup-summary">
                    <div>
                        <p class="muted">Device rating</p>
                        <div class="score-display compact">
                            <div class="score-value">{{ selectedDeviceRating.toFixed(1) }}</div>
                            <div class="score-denominator">/ 4</div>
                        </div>
                    </div>
                    <p class="muted">Focus on improving the low-rated rows to raise this device's privacy posture.</p>
                </div>
                <div class="device-table-wrapper">
                    <table class="device-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Currently using</th>
                                <th>Rating</th>
                                <th>Recommendations</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in deviceRows" :key="row.questionId">
                                <td>{{ row.label }}</td>
                                <td>
                                    <div class="current-app-cell">
                                        <span>{{ row.currentApp }}</span>
                                        <BaseButton variant="ghost" size="small" @click="jumpToQuestion(row.questionId)">
                                            ✏️ Edit
                                        </BaseButton>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge" :class="row.scoreClass">{{ row.scoreLabel }}</span>
                                </td>
                                <td>
                                    <p v-if="row.recommendations.length">{{ row.recommendations[0] }}</p>
                                    <p v-else class="muted">Finish the question to unlock recommendations.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="muted table-note">Privacy score is the average of each device rating ({{ privacyScoreDisplay }}/4).</p>
                </div>
            </section>

            <section class="actions-section">
                <div class="card">
                    <h2>Save Your Data</h2>
                    <p>Export your encrypted quiz results to keep track of your privacy journey.</p>
                    <div class="action-buttons">
                        <BaseButton variant="primary" @click="exportData">
                            💾 Export Encrypted Data
                        </BaseButton>
                        <BaseButton variant="outline" @click="importData">
                            📥 Import Data
                        </BaseButton>
                        <BaseButton variant="outline" @click="resetData">
                            🔄 Retake Quiz
                        </BaseButton>
                        <BaseButton variant="danger" @click="showDeleteConfirm = true">
                            🗑️ Delete All Data
                        </BaseButton>
                    </div>
                </div>
            </section>
        </div>

        <BaseModal v-model:visible="showDeleteConfirm" title="⚠️ Delete All Data?" :hideCloseButton="true">
            <p>This will permanently delete all your quiz answers and results. This action cannot be undone.</p>
            <p><strong>Make sure you've exported your data if you want to keep it!</strong></p>
            <template #footer>
                <BaseButton variant="outline" @click="cancelDelete">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirmDelete">Delete Everything</BaseButton>
            </template>
        </BaseModal>

        <BaseModal v-model:visible="showPasswordModal" title="🔐 Enter Password" :hideCloseButton="true">
            <div class="file-info">
                <p class="file-label">Selected file:</p>
                <div class="file-name">
                    <p>📄 {{ fileName }}</p>
                    <BaseButton variant="outline" size="small" class="change-file" @click="loadDifferentFile">
                        📂 Change File
                    </BaseButton>
                </div>
            </div>
            <p>Enter your password to decrypt the file:</p>
            <BaseInput
                v-model="passwordInput"
                type="password"
                class="password-input"
                :class="{ error: passwordError }"
                @keyup.enter="submitPassword"
                ref="passwordInputRef"
            />
            <div v-if="passwordError" class="error-message">
                ⚠️ {{ passwordError }}
            </div>
            <template #footer>
                <BaseButton variant="outline" size="small" @click="cancelPasswordInput">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="submitPassword" :disabled="!passwordInput">Decrypt</BaseButton>
            </template>
        </BaseModal>

        <BaseModal v-model:visible="showExportModal" title="🔐 Set Password" :hideCloseButton="true">
            <p>Choose a strong password to encrypt your data:</p>
            <BaseInput
                v-model="passwordInput"
                type="password"
                class="password-input"
                :class="{ error: exportPasswordError }"
                @keyup.enter="submitExport"
                ref="exportPasswordInputRef"
            />
            <div v-if="exportPasswordError" class="error-message">
                ⚠️ {{ exportPasswordError }}
            </div>
            <p class="hint">Remember this password - you'll need it to load your data later!</p>
            <template #footer>
                <BaseButton variant="outline" size="small" @click="cancelExport">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="submitExport" :disabled="!passwordInput">Encrypt & Export</BaseButton>
            </template>
        </BaseModal>

        <BaseModal v-model:visible="showExportConfirmModal" title="🔐 Create Export Password" :hideCloseButton="true">
            <p>Create a strong password to encrypt your data:</p>
            <BaseInput
                v-model="passwordInput"
                type="password"
                class="password-input"
                :class="{ error: exportPasswordError }"
                placeholder="Enter password"
                @keyup.enter="submitExportConfirm"
                ref="exportPasswordInputRef"
            />
            <p class="confirm-hint">Re-enter your password to confirm:</p>
            <BaseInput
                v-model="confirmPassword"
                type="password"
                class="password-input"
                :class="{ error: exportPasswordError }"
                placeholder="Confirm password"
                @keyup.enter="submitExportConfirm"
            />
            <div v-if="exportPasswordError" class="error-message">
                ⚠️ {{ exportPasswordError }}
            </div>
            <p class="hint">Remember this password - you'll need it to load your data later!</p>
            <template #footer>
                <BaseButton variant="outline" size="small" @click="cancelExportConfirm">Cancel</BaseButton>
                <BaseButton variant="primary" size="small" @click="submitExportConfirm" :disabled="!passwordInput || !confirmPassword">Encrypt & Export</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import type { DeviceType } from '../data/devices'
import { useQuizStore } from '../stores/quiz'
import type { AppCategory } from '../stores/quiz'
import { showToast } from '../utils/toast'
import { validateExportFile } from '../utils/crypto'

const router = useRouter()
const quizStore = useQuizStore()
const showDeleteConfirm = ref(false)
const showPasswordModal = ref(false)
const showExportModal = ref(false)
const showExportConfirmModal = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const exportPasswordError = ref('')
const fileName = ref('')
const passwordInputRef = ref<{ focus: () => void } | null>(null)
const exportPasswordInputRef = ref<{ focus: () => void } | null>(null)
const confirmPassword = ref('')
const lastExportTime = ref<number | null>(null)
let pendingFile: File | null = null
let isLoadAction = false

const deviceTypes: DeviceType[] = ['pc', 'phone', 'tablet']
const selectedDevice = ref<DeviceType>('pc')

const hasAnswers = computed(() => quizStore.answers.length > 0)
const isCompleted = computed(() => quizStore.isCompleted)
const shouldContinueQuiz = computed(() => hasAnswers.value && !isCompleted.value)
const hasUnsavedChanges = computed(() => hasAnswers.value && lastExportTime.value === null)
const appCategories = computed<AppCategory[]>(() => quizStore.getAppCategories())
const actionableRecommendations = computed(() => {
    return appCategories.value
        .filter((category) => category.recommendations.length > 0)
    .sort((a, b) => a.scoreValue - b.scoreValue)
        .slice(0, 3)
})
const threatEntries = computed(() => quizStore.threatEntries)
const manualOverride = computed(() => quizStore.manualOverride)
const displayThreatLevel = computed(() => quizStore.displayThreatLevel)
const displayThreatSpectrumInfo = computed(() => quizStore.displayThreatSpectrumInfo)
const displayThreatSpectrumLabel = computed(() => displayThreatSpectrumInfo.value.label)
const displayThreatSpectrumDescription = computed(() => displayThreatSpectrumInfo.value.description)
const computedThreatSpectrumInfo = computed(() => quizStore.computedThreatSpectrumInfo)
const threatLevelOptions = computed(() => quizStore.threatSpectrumOptions)
const privacyScoreNormalized = computed(() => quizStore.privacyScoreNormalized)
const privacyScoreDisplay = computed(() => privacyScoreNormalized.value.toFixed(1))
const quizFlow = computed(() => quizStore.quizFlow)
const deviceRows = computed(() => quizStore.getDeviceSetup(selectedDevice.value))
const selectedDeviceRating = computed(() => quizStore.getDeviceRatingNormalized(selectedDevice.value))
const deviceLabel = computed(() => {
    if (selectedDevice.value === 'pc') return 'Desktop'
    if (selectedDevice.value === 'phone') return 'Phone'
    return 'Tablet'
})
const scoreDescription = computed(() => {
    if (!hasAnswers.value) {
        return 'Complete the quiz to unlock the personalized score and device breakdown.'
    }
    const score = privacyScoreNormalized.value
    if (score >= 3.5) return `Excellent! Your ${displayThreatSpectrumLabel.value} profile is well protected across devices.`
    if (score >= 2.5) return `Strong! Your ${displayThreatSpectrumLabel.value} profile is mostly aligned with your goals.`
    if (score >= 1.5) return `Fair. Your ${displayThreatSpectrumLabel.value} profile still has some exposed areas.`
    return `Needs attention. The ${displayThreatSpectrumLabel.value} profile deserves more focused controls.`
})
const handleThreatLevelChange = (event: Event) => {
    const select = event.target as HTMLSelectElement
    quizStore.setManualThreatLevel(Number(select.value))
}

const resetThreatLevel = () => {
    quizStore.resetManualThreatLevel()
}

const selectDevice = (device: DeviceType) => {
    selectedDevice.value = device
}

const jumpToQuestion = (questionId: string) => {
    const index = quizFlow.value.findIndex((item) => item.question.id === questionId)
    if (index === -1) return
    quizStore.currentQuestionIndex = index
    router.push('/quiz')
}
const jumpToThreatPriorities = () => jumpToQuestion('threat-priorities')

const reviewQuiz = () => {
    router.push('/quiz')
}

const loadDashboard = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) {
            showToast('File selection cancelled', 'warning')
            return
        }

        try {
            await validateExportFile(file)
            pendingFile = file
            fileName.value = file.name
            isLoadAction = true
            passwordInput.value = ''
            passwordError.value = ''
            showPasswordModal.value = true
            nextTick(() => {
                passwordInputRef.value?.focus()
            })
        } catch (error) {
            const err = error as Error
            showToast(err.message, 'error')
            fileInput.click()
        }
    }

    fileInput.click()
}

const exportData = () => {
    if (lastExportTime.value === null) {
        passwordInput.value = ''
        confirmPassword.value = ''
        exportPasswordError.value = ''
        showExportConfirmModal.value = true
        nextTick(() => {
            exportPasswordInputRef.value?.focus()
        })
    } else {
        passwordInput.value = ''
        exportPasswordError.value = ''
        showExportModal.value = true
        nextTick(() => {
            exportPasswordInputRef.value?.focus()
        })
    }
}

const submitExport = async () => {
    if (!passwordInput.value) return

    try {
        const success = await quizStore.exportEncryptedData(passwordInput.value)
        if (!success) {
            exportPasswordError.value = 'Failed to export file. Please try again.'
            return
        }
        lastExportTime.value = Date.now()
        showExportModal.value = false
        showToast('Data exported successfully!', 'success')
        passwordInput.value = ''
        exportPasswordError.value = ''
    } catch (error) {
        const err = error as Error
        exportPasswordError.value = err.message
    }
}

const cancelExport = () => {
    showExportModal.value = false
    passwordInput.value = ''
    exportPasswordError.value = ''
}

const submitExportConfirm = async () => {
    if (!passwordInput.value || !confirmPassword.value) return

    if (passwordInput.value !== confirmPassword.value) {
        exportPasswordError.value = 'Passwords do not match. Please try again.'
        return
    }

    try {
        const success = await quizStore.exportEncryptedData(passwordInput.value)
        if (!success) {
            exportPasswordError.value = 'Failed to export file. Please try again.'
            return
        }
        lastExportTime.value = Date.now()
        showExportConfirmModal.value = false
        showToast('Data exported successfully!', 'success')
        passwordInput.value = ''
        confirmPassword.value = ''
        exportPasswordError.value = ''
    } catch (error) {
        const err = error as Error
        exportPasswordError.value = err.message
    }
}

const cancelExportConfirm = () => {
    showExportConfirmModal.value = false
    passwordInput.value = ''
    confirmPassword.value = ''
    exportPasswordError.value = ''
}

const importData = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) {
            showToast('File selection cancelled', 'warning')
            return
        }

        try {
            await validateExportFile(file)
            pendingFile = file
            fileName.value = file.name
            isLoadAction = false
            passwordInput.value = ''
            passwordError.value = ''
            showPasswordModal.value = true
            nextTick(() => {
                passwordInputRef.value?.focus()
            })
        } catch (error) {
            const err = error as Error
            showToast(err.message, 'error')
            fileInput.click()
        }
    }

    fileInput.click()
}

const submitPassword = async () => {
    if (!passwordInput.value || !pendingFile) return

    try {
        await quizStore.importEncryptedData(pendingFile, passwordInput.value)
        showPasswordModal.value = false
        const message = isLoadAction ? 'Data loaded successfully!' : 'Data imported successfully!'
        showToast(message, 'success')
        if (!quizStore.isCompleted) {
            router.push('/quiz')
        }
        pendingFile = null
        passwordInput.value = ''
        passwordError.value = ''
    } catch (error) {
        const err = error as Error
        passwordError.value = err.message
    }
}

const cancelPasswordInput = () => {
    showPasswordModal.value = false
    pendingFile = null
    fileName.value = ''
    passwordInput.value = ''
    passwordError.value = ''
}

const loadDifferentFile = () => {
    if (isLoadAction) {
        cancelPasswordInput()
        loadDashboard()
    } else {
        cancelPasswordInput()
        importData()
    }
}

const resetData = () => {
    showDeleteConfirm.value = true
}

const confirmDelete = () => {
    quizStore.resetQuiz()
    showDeleteConfirm.value = false
    showToast('All data deleted successfully', 'success')
    router.push('/quiz')
}

const cancelDelete = () => {
    showDeleteConfirm.value = false
}
</script>

<style scoped>
.dashboard {
    padding-top: 2rem;
}

.empty-state,
.continue-state,
.card {
    border-radius: 16px;
    padding: 2rem;
    background: var(--card-bg);
    box-shadow: 0 18px 40px rgba(15, 18, 48, 0.08);
}

.empty-state,
.continue-state {
    text-align: center;
}

.continue-state {
    border: 2px dashed var(--primary-color);
    margin-bottom: 2rem;
}

.warning-banner,
.success-banner {
    border-radius: 14px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.warning-banner {
    background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%);
    border: 2px solid #ffc107;
}

.success-banner {
    background: linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%);
    border: 2px solid #28a745;
}

.dashboard-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.threat-model-panel,
.score-panel {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.panel-heading h2 {
    margin: 0.25rem 0;
    color: var(--primary-color);
}

.heading-main {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.heading-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.manual-tag {
    padding: 0.1rem 0.75rem;
    background: var(--border-color);
    border-radius: 999px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.heading-select-wrapper {
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.heading-select-wrapper select {
    border-radius: 999px;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    background: var(--card-bg);
    color: var(--text-primary);
    font-weight: 600;
}

.reset-button {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    cursor: pointer;
}

.awareness-display {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.score-display {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.score-display.compact .score-value {
    font-size: 3.2rem;
}

.score-value {
    font-size: 4rem;
    color: var(--primary-color);
    font-weight: 700;
}

.score-denominator {
    font-size: 1.4rem;
    color: var(--text-secondary);
}

.score-description {
    margin: 0;
    color: var(--text-secondary);
}

.threat-body {
    display: grid;
    gap: 1rem;
}

.threat-chips {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.chip {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--border-color);
}

.chip.high {
    background: #ffe2e2;
    color: #c00;
}

.chip.medium {
    background: #fff4dd;
    color: #c97100;
}

.chip.low {
    background: #e2f0ff;
    color: #0056c1;
}

.priority-actions ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.priority-actions li {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    background: var(--card-bg);
}

.device-switcher {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin: 1rem 0;
}

.device-switcher .base-button {
    border-radius: 999px;
    border: 1px solid var(--border-color);
}

.device-switcher .base-button.active {
    background: var(--primary-color);
    color: #fff;
    border-color: var(--primary-color);
}

.device-setup {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.setup-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
}

.device-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

.device-table th,
.device-table td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.badge {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: inline-flex;
    align-items: center;
}

.badge.good {
    background: #e2f4ea;
    color: #0f7c4d;
}

.badge.medium {
    background: #fff4dd;
    color: #c97100;
}

.badge.poor {
    background: #ffe2e2;
    color: #9c1c1c;
}

.table-note {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.current-app-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.threat-entry-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.answers-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.answer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.answer-question {
    margin: 0;
    font-weight: 600;
}

.answer-value {
    margin: 0;
    color: var(--text-secondary);
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.panel-actions {
    display: flex;
    justify-content: flex-end;
}

.muted {
    color: var(--text-secondary);
}

.score-panel .eyebrow,
.threat-model-panel .eyebrow {
    color: var(--text-secondary);
    letter-spacing: 0.2em;
    font-size: 0.7rem;
}

.file-info {
    margin-bottom: 1rem;
}

.file-name {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.file-label {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.password-input {
    width: 100%;
    margin-bottom: 0.5rem;
}

.error-message {
    color: #c00;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.hint,
.confirm-hint {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

@media (max-width: 720px) {
    .dashboard-metrics {
        grid-template-columns: 1fr;
    }

    .device-switcher,
    .setup-summary,
    .answers-list {
        flex-direction: column;
    }

    .answer-row {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
