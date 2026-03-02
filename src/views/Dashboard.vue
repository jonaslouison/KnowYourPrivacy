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
            <div v-if="dashboardBannerType === 'warning'" class="dashboard-banner warning-banner">
                <span class="banner-icon">⚠️</span>
                <span class="banner-text"><strong>Unsaved changes</strong> — Export your data to save your progress.</span>
                <BaseButton variant="primary" size="small" @click="exportData">
                    💾 Export Now
                </BaseButton>
            </div>

            <div v-else-if="dashboardBannerType === 'success'" class="dashboard-banner success-banner">
                <span class="banner-icon">✅</span>
                <span class="banner-text"><strong>Saved</strong> — Your data is securely stored in {{ dashboardFileLabel }}.</span>
            </div>

            <div class="dashboard-metrics">
                <div class="left-panels">
                    <section class="threat-model-panel card">
                        <div class="panel-heading">
                            <div class="heading-main">
                                <div class="heading-title">
                                    <h2 class="panel-title">Threat Model</h2>
                                    <BaseTooltip 
                                        text="Your threat model defines who you're protecting your data from. Higher levels mean more privacy but may require more effort to maintain."
                                        position="bottom"
                                        aria-label="What is a threat model?"
                                    />
                                    <BaseDropdown
                                        id="threat-level-select"
                                        :model-value="displayThreatLevel"
                                        :options="threatLevelDropdownOptions"
                                        @update:modelValue="handleThreatLevelChange"
                                    />
                                    <span class="status-tag" :class="manualOverride ? 'manual' : 'computed'">{{ manualTagLabel }}</span>
                                    <BaseButton 
                                        v-if="manualOverride" 
                                        variant="outline" 
                                        size="small" 
                                        class="reset-btn"
                                        @click="resetThreatLevel"
                                    >
                                        ↺ Reset
                                    </BaseButton>
                                </div>
                            </div>
                            <p class="subtext">{{ displayThreatSpectrumLabel }} · {{ displayThreatSpectrumDescription }}</p>
                            <p class="meta">Computed: Level {{ quizStore.computedThreatLevel }} · {{ computedThreatSpectrumInfo.label }}</p>
                        </div>
                        <div class="threat-body">
                            <div class="tierlist-column">
                                <BaseTierlist
                                    :tiers="tierDefinitions"
                                    :items="threatTierItems"
                                    :assignments="threatTierAssignments"
                                    :show-available-zone="false"
                                    @update:assignments="updateTierAssignments"
                                />
                            </div>
                        </div>
                    </section>

                    <section class="save-data-panel card">
                        <div class="panel-heading">
                            <div class="panel-heading-row">
                                <h2>Save Your Data</h2>
                                <BaseTooltip 
                                    text="Your quiz data is stored locally and encrypted. Export regularly to keep a backup you can import on other devices."
                                    position="right"
                                    aria-label="About saving your data"
                                />
                            </div>
                            <p class="subtext">Export your encrypted quiz results to keep track of your privacy journey.</p>
                        </div>
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
                    </section>
                </div>

                <div class="right-panels">
                    <section class="score-panel card">
                        <div class="panel-heading">
                            <div class="panel-heading-row">
                                <h2>Privacy Score</h2>
                                <BaseTooltip 
                                    text="Your privacy score (0-4) reflects how well your current apps and services align with your threat model. Higher is better."
                                    position="bottom"
                                    aria-label="What is the privacy score?"
                                />
                            </div>
                            <p class="subtext">Average of your device ratings</p>
                        </div>
                        <div class="score-display compact">
                            <div class="score-value">{{ privacyScoreDisplay }}</div>
                            <div class="score-denominator">/ 4</div>
                        </div>
                        <p class="score-description">{{ scoreDescription }}</p>
                    </section>

                    <section class="priority-panel card">
                        <div class="panel-heading">
                            <div class="panel-heading-row">
                                <h2>Priority Actions</h2>
                                <BaseTooltip 
                                    text="These are the most impactful changes you can make right now. Focus on replacing red and orange rated services first."
                                    position="bottom"
                                    aria-label="What are priority actions?"
                                />
                            </div>
                            <p class="subtext">Top improvements for your threat level</p>
                        </div>
                        <div class="priority-list">
                            <div 
                                v-for="recItem in actionableRecommendations" 
                                :key="recItem.name"
                                class="priority-item"
                                :class="getPriorityClass(recItem)"
                            >
                                <div class="priority-category">
                                    <span class="priority-icon">{{ recItem.icon }}</span>
                                    <span class="priority-name">{{ recItem.name }}</span>
                                </div>
                                <SelectionFlow
                                    :current-name="recItem.currentApp"
                                    current-label="Current"
                                    :current-to="getWikiLink(recItem.questionId, recItem.currentAppId)"
                                    :current-rating="recItem.scoreClass"
                                    :recommended-name="recItem.recommendedApp || recItem.recommendations[0]"
                                    :recommended-label="recItem.recommendedApp ? 'Switch to' : 'Explore options'"
                                    :recommended-to="getWikiLink(recItem.questionId, recItem.recommendedAppId || '')"
                                />
                            </div>
                            <div v-if="!actionableRecommendations.length" class="priority-item success">
                                <span class="priority-icon">✓</span>
                                <span class="priority-success-text">You've matched every core app to your threat model.</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <section class="device-setup card">
                <div class="panel-heading">
                    <h2>Your Digital Setup</h2>
                    <p class="muted">Each table below shows the current apps you use for that device. Ratings feed into the overall privacy score.</p>
                </div>
                <div class="table-section">
                    <div class="table-heading-row">
                        <p class="table-heading">General Services</p>
                        <div class="general-service-rating">
                            <p class="muted">Service rating</p>
                            <div class="score-display compact">
                                <div class="score-value">{{ generalServiceRating.toFixed(1) }}</div>
                                <div class="score-denominator">/ 4</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mobile Cards View -->
                    <div class="mobile-cards-view">
                        <div v-for="service in generalServicesRows" :key="service.questionId" class="service-card">
                            <div class="card-grid">
                                <div class="card-cell category-cell">
                                    <router-link 
                                        :to="`/wiki/${getCategoryIdFromQuestionId(service.questionId)}`"
                                        class="category-link"
                                    >
                                        {{ service.label }}
                                        <span class="link-icon">→</span>
                                    </router-link>
                                </div>
                                <div class="card-cell rating-cell">
                                    <span class="badge" :class="service.scoreClass">{{ service.scoreLabel }}</span>
                                </div>
                                <div class="card-cell current-cell">
                                    <label class="cell-label">Currently using</label>
                                    <div class="dropdown-with-link">
                                        <BaseDropdown
                                            :model-value="getCurrentAnswerValue(service.questionId)"
                                            :options="getDropdownOptions(service.questionId)"
                                            placeholder="Awaiting response"
                                            @update:modelValue="(value) => handleGeneralOptionChange(service.questionId, value)"
                                        />
                                        <router-link
                                            v-if="getServiceWikiLink(service.questionId)"
                                            :to="getServiceWikiLink(service.questionId)!"
                                            class="service-hash-link"
                                            title="View service details"
                                        >#</router-link>
                                    </div>
                                </div>
                                <div class="card-cell recommended-cell">
                                    <label class="cell-label">Recommended</label>
                                    <p v-if="service.recommendations.length" class="recommendation-text">{{ service.recommendations[0] }}</p>
                                    <p v-else class="muted">Complete quiz</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Desktop Table View -->
                    <div class="table-wrapper">
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
                                <tr v-for="service in generalServicesRows" :key="service.questionId">
                                <td class="category-cell">
                                    <router-link 
                                        :to="`/wiki/${getCategoryIdFromQuestionId(service.questionId)}`"
                                        class="category-link"
                                    >
                                        {{ service.label }}
                                        <span class="link-icon">→</span>
                                    </router-link>
                                </td>
                                <td class="currently-using-cell">
                                    <div class="dropdown-with-link">
                                        <BaseDropdown
                                            :model-value="getCurrentAnswerValue(service.questionId)"
                                            :options="getDropdownOptions(service.questionId)"
                                            placeholder="Awaiting response"
                                            @update:modelValue="(value) => handleGeneralOptionChange(service.questionId, value)"
                                        />
                                        <router-link
                                            v-if="getServiceWikiLink(service.questionId)"
                                            :to="getServiceWikiLink(service.questionId)!"
                                            class="service-hash-link"
                                            title="View service details"
                                        >#</router-link>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge" :class="service.scoreClass">{{ service.scoreLabel }}</span>
                                </td>
                                <td>
                                    <p v-if="service.recommendations.length">{{ service.recommendations[0] }}</p>
                                    <p v-else class="muted">Finish the question to unlock recommendations.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
                
                <div class="table-section">
                    <div class="device-specific-header">
                        <p class="table-heading">Device Specific</p>
                        <div class="device-controls">
                            <BaseButton
                                v-for="device in deviceTypes"
                                :key="device"
                                :variant="selectedDevice === device ? 'primary' : 'outline'"
                                size="small"
                                @click="selectDevice(device)"
                            >
                                {{ device === 'pc' ? 'Desktop' : device === 'phone' ? 'Phone' : 'Tablet' }}
                            </BaseButton>
                        </div>
                        <div class="device-rating">
                            <p class="muted">Device rating</p>
                            <div class="score-display compact">
                                <div class="score-value">{{ selectedDeviceRating.toFixed(1) }}</div>
                                <div class="score-denominator">/ 4</div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Cards View -->
                    <div class="mobile-cards-view">
                        <div v-for="row in deviceSpecificRows" :key="row.questionId" class="service-card">
                            <div class="card-grid">
                                <div class="card-cell category-cell">
                                    <router-link 
                                        :to="getDeviceWikiPath(row.questionId)"
                                        class="category-link"
                                    >
                                        {{ row.label }}
                                        <span class="link-icon">→</span>
                                    </router-link>
                                </div>
                                <div class="card-cell rating-cell">
                                    <span class="badge" :class="row.scoreClass">{{ row.scoreLabel }}</span>
                                </div>
                                <div class="card-cell current-cell">
                                    <label class="cell-label">Currently using</label>
                                    <div class="dropdown-with-link">
                                        <BaseDropdown
                                            :model-value="getCurrentAnswerValue(row.questionId)"
                                            :options="getDropdownOptions(row.questionId)"
                                            placeholder="Awaiting response"
                                            @update:modelValue="(value) => handleDeviceOptionChange(row.questionId, value)"
                                        />
                                        <router-link
                                            v-if="getDeviceServiceWikiLink(row.questionId)"
                                            :to="getDeviceServiceWikiLink(row.questionId)!"
                                            class="service-hash-link"
                                            title="View service details"
                                        >#</router-link>
                                    </div>
                                </div>
                                <div class="card-cell recommended-cell">
                                    <label class="cell-label">Recommended</label>
                                    <p v-if="row.recommendations.length" class="recommendation-text">{{ row.recommendations[0] }}</p>
                                    <p v-else class="muted">Complete quiz</p>
                                </div>
                            </div>
                        </div>
                        <div v-if="!deviceSpecificRows.length" class="empty-state-mobile">
                            <p class="muted">Complete more selections to unlock device-specific suggestions.</p>
                        </div>
                    </div>

                    <!-- Desktop Table View -->
                    <div class="table-wrapper">
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
                                <tr v-for="row in deviceSpecificRows" :key="row.questionId">
                                <td class="category-cell">
                                    <router-link 
                                        :to="getDeviceWikiPath(row.questionId)"
                                        class="category-link"
                                    >
                                        {{ row.label }}
                                        <span class="link-icon">→</span>
                                    </router-link>
                                </td>
                                <td class="currently-using-cell">
                                    <div class="dropdown-with-link">
                                        <BaseDropdown
                                            :model-value="getCurrentAnswerValue(row.questionId)"
                                            :options="getDropdownOptions(row.questionId)"
                                            placeholder="Awaiting response"
                                            @update:modelValue="(value) => handleDeviceOptionChange(row.questionId, value)"
                                        />
                                        <router-link
                                            v-if="getDeviceServiceWikiLink(row.questionId)"
                                            :to="getDeviceServiceWikiLink(row.questionId)!"
                                            class="service-hash-link"
                                            title="View service details"
                                        >#</router-link>
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
                            <tr v-if="!deviceSpecificRows.length">
                                <td colspan="4" class="muted">Complete more selections to unlock device-specific suggestions.</td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                </div>
                <p class="muted table-note">Privacy score is the average of each device rating ({{ privacyScoreDisplay }}/4).</p>
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
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import BaseTierlist from '../components/BaseTierlist.vue'
import BaseDropdown from '../components/BaseDropdown.vue'
import BaseTooltip from '../components/BaseTooltip.vue'
import SelectionFlow from '../components/SelectionFlow.vue'
import type { DeviceType } from '../data/devices'
import { getCategoryIdFromQuestionId, getServiceAnchorFromAnswer, getServiceAnchorFromCategoryId } from '../data/wiki'
import {
    formatThreatTierEntry,
    parseThreatTierAnswerValue,
    THREAT_CATALOG,
    THREAT_TIER_LABELS,
    THREAT_TIER_ORDER,
    useQuizStore
} from '../stores/quiz'
import type { AppCategory, ThreatTierId } from '../stores/quiz'
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
const isApplyingExternalData = ref(false)
let pendingFile: File | null = null
let isLoadAction = false

// Reset state when password modal is closed (e.g., by clicking outside)
watch(showPasswordModal, (isVisible, wasVisible) => {
    if (wasVisible && !isVisible && pendingFile) {
        // Modal was closed without successful import
        pendingFile = null
        fileName.value = ''
        passwordInput.value = ''
        passwordError.value = ''
    }
})

const GENERAL_SERVICE_DEFINITIONS = [
    { questionId: 'email-provider', label: 'Email Provider' },
    { questionId: 'cloud-storage', label: 'Cloud Storage' },
    { questionId: 'password-manager', label: 'Password Manager' },
    { questionId: 'vpn-usage', label: 'VPN Service' },
    { questionId: 'messaging-app', label: 'Messaging App' }
] as const
const GENERAL_SERVICE_QUESTION_IDS = GENERAL_SERVICE_DEFINITIONS.map((entry) => entry.questionId)

const deviceTypes: DeviceType[] = ['pc', 'phone', 'tablet']
const selectedDevice = ref<DeviceType>('pc')

const hasAnswers = computed(() => quizStore.answers.length > 0)
const isCompleted = computed(() => quizStore.isCompleted)
const shouldContinueQuiz = computed(() => hasAnswers.value && !isCompleted.value)
const hasUnsavedChanges = ref(false)

// Check on mount if there's unsaved quiz data (e.g., just completed quiz)
onMounted(() => {
    // If quiz is completed and no export time recorded, it means user just finished the quiz
    if (isCompleted.value && lastExportTime.value === null && !quizStore.isLoadedFromFile) {
        hasUnsavedChanges.value = true
    }
})

const appCategories = computed<AppCategory[]>(() => quizStore.getAppCategories())
const generalServicesRows = computed(() =>
    GENERAL_SERVICE_DEFINITIONS.map((definition) => {
        const category = appCategories.value.find((entry) => entry.name === definition.label)
        return {
            questionId: definition.questionId,
            label: definition.label,
            scoreLabel: category?.score ?? 'Pending',
            scoreClass: category?.scoreClass ?? 'poor',
            scoreValue: category?.scoreValue ?? 0,
            recommendations: category?.recommendations ?? [],
            currentApp: category?.currentApp ?? 'Awaiting response'
        }
    })
)
const generalServiceRating = computed(() => {
    const scoredValues = generalServicesRows.value.map((service) => service.scoreValue).filter((value) => value > 0)
    if (!scoredValues.length) return 0
    const average = scoredValues.reduce((sum, value) => sum + value, 0) / scoredValues.length
    return Math.round((average / 25) * 10) / 10
})
const actionableRecommendations = computed(() => {
    return appCategories.value
        // Show items that have recommendations AND either:
        // - have a recommended app (for poor/medium scores), OR
        // - have a poor or medium score (red/orange - needs improvement)
        .filter((category) => 
            category.recommendations.length > 0 && 
            (category.recommendedApp || category.scoreClass !== 'good')
        )
        .sort((a, b) => a.scoreValue - b.scoreValue)
        .slice(0, 2)
})

// Get priority class based on score (matches wiki rating colors)
const getPriorityClass = (item: { scoreValue: number; scoreClass: string }) => {
    // scoreClass is 'good', 'medium', 'poor' - map to avoid/caution/good
    if (item.scoreClass === 'poor') return 'avoid'      // red - needs urgent action
    if (item.scoreClass === 'medium') return 'caution'  // orange - needs improvement
    return 'good'                                         // green - already good
}

// Get wiki link for a service
const getWikiLink = (questionId: string, serviceId: string): string => {
    const categoryId = getCategoryIdFromQuestionId(questionId)
    if (!categoryId) return '#'
    return serviceId ? `/wiki/${categoryId}#${serviceId}` : `/wiki/${categoryId}`
}

const tierDefinitions = THREAT_TIER_ORDER.map((tier) => ({
    id: tier,
    label: THREAT_TIER_LABELS[tier]
}))
const threatTierItems = THREAT_CATALOG.map((entry) => {
    const label = entry.label || entry.id
    return { id: label, label }
})
const threatTierAssignments = computed<Record<ThreatTierId, string[]>>(() =>
    parseThreatTierAnswerValue(quizStore.getAnswer('threat-priorities'))
)
const updateTierAssignments = (value: Record<ThreatTierId, string[]>) => {
    const ordered = THREAT_TIER_ORDER.flatMap((tier) =>
        (value[tier] ?? []).map((label) => formatThreatTierEntry(tier, label))
    )
    quizStore.setThreatOrder(ordered)
    // Reset manual override so the dropdown shows the newly computed level
    quizStore.resetManualThreatLevel()
    markUnsaved()
}

const markUnsaved = () => {
    lastExportTime.value = null
    hasUnsavedChanges.value = true
}

watch(
    () => quizStore.answers,
    () => {
        if (isApplyingExternalData.value) return
        if (!quizStore.isLoadedFromFile) return
        markUnsaved()
    },
    { deep: true }
)
const manualOverride = computed(() => quizStore.manualOverride)
const manualTagLabel = computed(() => (manualOverride.value ? 'Manual' : 'Computed'))
const displayThreatLevel = computed(() => quizStore.displayThreatLevel)
const displayThreatSpectrumInfo = computed(() => quizStore.displayThreatSpectrumInfo)
const displayThreatSpectrumLabel = computed(() => displayThreatSpectrumInfo.value.label)
const displayThreatSpectrumDescription = computed(() => displayThreatSpectrumInfo.value.description)
const computedThreatSpectrumInfo = computed(() => quizStore.computedThreatSpectrumInfo)
const threatLevelOptions = computed(() => quizStore.threatSpectrumOptions)
const threatLevelDropdownOptions = computed(() =>
    threatLevelOptions.value.map((option) => ({
        value: option.level,
        label: `Level ${option.level} · ${option.label}`
    }))
)
const privacyScoreNormalized = computed(() => quizStore.privacyScoreNormalized)
const privacyScoreDisplay = computed(() => privacyScoreNormalized.value.toFixed(1))
const deviceRows = computed(() => quizStore.getDeviceSetup(selectedDevice.value))
const deviceSpecificRows = computed(() => deviceRows.value.filter((row) => !(GENERAL_SERVICE_QUESTION_IDS as readonly string[]).includes(row.questionId)))
const selectedDeviceRating = computed(() => quizStore.getDeviceRatingNormalized(selectedDevice.value))
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
const dashboardBannerType = computed<'warning' | 'success' | null>(() => {
    // Show warning if there are unsaved changes (after quiz, tierlist changes, etc.)
    if (hasUnsavedChanges.value) return 'warning'
    // Show success only if data was loaded from file and no changes since
    if (quizStore.isLoadedFromFile && lastExportTime.value !== null) return 'success'
    return null
})
const dashboardFileLabel = computed(() => fileName.value || 'your data')
const handleThreatLevelChange = (value: string | number) => {
    quizStore.setManualThreatLevel(Number(value))
    markUnsaved()
}

const resetThreatLevel = () => {
    quizStore.resetManualThreatLevel()
    markUnsaved()
}

const selectDevice = (device: DeviceType) => {
    selectedDevice.value = device
}

const getDeviceWikiPath = (questionId: string): string => {
    // Map device-specific question IDs to appropriate wiki categories
    if (questionId.includes('os-desktop')) return '/wiki/desktop-os'
    if (questionId.includes('os-mobile')) return '/wiki/mobile-os'
    if (questionId.includes('os-tablet')) return '/wiki/tablet-os'
    if (questionId.includes('browser-desktop')) return '/wiki/desktop-browsers'
    if (questionId.includes('browser-mobile')) return '/wiki/mobile-browsers'
    if (questionId.includes('search-engine')) return '/wiki/search-engines'
    // Fallback to generic category lookup
    const categoryId = getCategoryIdFromQuestionId(questionId)
    return categoryId ? `/wiki/${categoryId}` : '/dashboard'
}

const getServiceWikiLink = (questionId: string): string | null => {
    const answerValue = getCurrentAnswerValue(questionId)
    if (!answerValue) return null
    const categoryId = getCategoryIdFromQuestionId(questionId)
    if (!categoryId) return null
    const serviceAnchor = getServiceAnchorFromAnswer(questionId, answerValue)
    if (!serviceAnchor) return `/wiki/${categoryId}`
    return `/wiki/${categoryId}#${serviceAnchor}`
}

const getDeviceServiceWikiLink = (questionId: string): string | null => {
    const answerValue = getCurrentAnswerValue(questionId)
    if (!answerValue) return null
    const wikiPath = getDeviceWikiPath(questionId)
    // Extract categoryId from path for service lookup
    const categoryId = wikiPath.replace('/wiki/', '')
    const serviceAnchor = getServiceAnchorFromCategoryId(categoryId, answerValue)
    if (!serviceAnchor) return wikiPath
    return `${wikiPath}#${serviceAnchor}`
}

const getQuestionOptions = (questionId: string) => {
    const question = quizStore.questions.find((entry) => entry.id === questionId)
    return question?.options ?? []
}

const getDropdownOptions = (questionId: string) =>
    getQuestionOptions(questionId).map((option) => ({ value: option.value, label: option.label }))

const getCurrentAnswerValue = (questionId: string) => {
    const answer = quizStore.getAnswer(questionId)
    if (!answer) return ''
    return Array.isArray(answer) ? answer[0] ?? '' : answer
}

const handleDeviceOptionChange = (questionId: string, value: string | number) => {
    if (!value) return
    quizStore.saveAnswer({ questionId, answer: String(value) })
    markUnsaved()
}

const handleGeneralOptionChange = (questionId: string, value: string | number) => {
    if (!value) return
    quizStore.saveAnswer({ questionId, answer: String(value) })
    markUnsaved()
}

const loadDashboard = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'

    fileInput.oncancel = () => {
    }

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
            showToast('Could not download your export file. Please try again.', 'warning')
            return
        }
        lastExportTime.value = Date.now()
        hasUnsavedChanges.value = false
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
            showToast('Could not download your export file. Please try again.', 'warning')
            return
        }
        lastExportTime.value = Date.now()
        hasUnsavedChanges.value = false
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

    fileInput.oncancel = () => {
    }

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

    isApplyingExternalData.value = true
    try {
        await quizStore.importEncryptedData(pendingFile, passwordInput.value)
        lastExportTime.value = Date.now()
        hasUnsavedChanges.value = false
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
    } finally {
        isApplyingExternalData.value = false
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
    router.push('/')
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

.dashboard-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    position: sticky;
    top: 60px; /* Below the app header */
    z-index: 50;
}

.dashboard-banner .banner-icon {
    font-size: 1rem;
    flex-shrink: 0;
}

.dashboard-banner .banner-text {
    flex: 1;
    font-size: 0.9rem;
    color: var(--text-primary);
}

.dashboard-banner .banner-text strong {
    font-weight: 600;
}

.warning-banner {
    background: color-mix(in srgb, var(--warning-color) 15%, transparent);
    border: 1px solid var(--warning-color);
}

.success-banner {
    background: color-mix(in srgb, var(--success-color) 15%, transparent);
    border: 1px solid var(--success-color);
}

.dashboard-metrics {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    overflow: hidden;
}

.left-panels {
    display: contents;
}

.right-panels {
    display: contents;
}

.threat-model-panel {
    grid-column: 1;
    grid-row: 1 / 3;
}

.save-data-panel {
    grid-column: 1;
    grid-row: 3;
}

.score-panel {
    grid-column: 2;
    grid-row: 1;
}

.priority-panel {
    grid-column: 2;
    grid-row: 2 / 4;
    min-height: 200px;
}

.threat-model-panel,
.score-panel,
.priority-panel,
.save-data-panel {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Priority Panel Styles */
.priority-panel .panel-heading h2 {
    margin: 0.25rem 0;
    color: var(--primary-color);
}

.priority-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
}

.priority-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--border-color);
    border-left: 4px solid var(--warning, #f59e0b);
    border-radius: 8px;
    padding: 0.75rem;
    background: var(--card-bg);
    transition: all 0.2s ease;
}

.priority-item.avoid {
    border-left-color: #ef4444;
}

.priority-item.caution {
    border-left-color: #f97316;
}

.priority-item.good {
    border-left-color: #22c55e;
}

.priority-item.success {
    border-left-color: #22c55e;
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.priority-item.success .priority-icon {
    font-size: 1.5rem;
}

.priority-category {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.priority-icon {
    font-size: 1rem;
    line-height: 1;
}

.priority-name {
    font-weight: 500;
}

/* mini-card styles are in SelectionFlow.vue component */

/* Save Data Panel */
.save-data-panel .panel-heading h2 {
    margin: 0.25rem 0;
    color: var(--primary-color);
}

.save-data-panel .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

@media (max-width: 900px) {
    .dashboard-metrics {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
    }
    
    .score-panel {
        grid-column: 1;
        grid-row: 1;
    }
    
    .priority-panel {
        grid-column: 1;
        grid-row: 2;
    }
    
    .threat-model-panel {
        grid-column: 1;
        grid-row: 3;
    }
    
    .save-data-panel {
        grid-column: 1;
        grid-row: 4;
    }
    
    .priority-flow {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .priority-arrow {
        transform: rotate(90deg);
    }
    
    .mini-card {
        width: 100%;
    }
}

.panel-heading h2 {
    margin: 0.25rem 0;
    color: var(--primary-color);
}

.panel-heading-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.heading-main {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
}

.heading-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.heading-title .panel-title {
    flex-shrink: 0;
}

.status-tag {
    padding: 0.2rem 0.75rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.status-tag.computed {
    background: color-mix(in srgb, var(--success-color) 15%, transparent);
    color: var(--success-color);
    border: 1px solid color-mix(in srgb, var(--success-color) 30%, transparent);
}

.status-tag.manual {
    background: color-mix(in srgb, var(--warning-color) 15%, transparent);
    color: var(--warning-color);
    border: 1px solid color-mix(in srgb, var(--warning-color) 30%, transparent);
}

.reset-btn {
    margin-left: 0.5rem;
}

.heading-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.heading-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
}

.meta {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.heading-select-wrapper {
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.reset-button {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    cursor: pointer;
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
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
}

.tierlist-column {
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 1rem;
    background: var(--card-bg);
}

.device-setup {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.device-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.25rem;
    table-layout: fixed;
}

.device-table th,
.device-table td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.device-table th:nth-child(1),
.device-table td:nth-child(1) {
    width: 20%;
}

.device-table th:nth-child(2),
.device-table td:nth-child(2) {
    width: 30%;
}

.device-table th:nth-child(3),
.device-table td:nth-child(3) {
    width: 12%;
}

.device-table th:nth-child(4),
.device-table td:nth-child(4) {
    width: 38%;
}

.category-cell {
    min-width: 140px;
}

.category-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--secondary-color);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s ease;
}

.category-link:hover {
    color: var(--primary-color);
    text-decoration: underline;
}

.category-link .link-icon {
    opacity: 0.6;
    transform: translateX(0);
    transition: opacity 0.15s ease, transform 0.15s ease;
    font-size: 0.875rem;
}

.category-link:hover .link-icon {
    opacity: 1;
    transform: translateX(2px);
}

.dropdown-with-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.service-hash-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 6px;
    background: transparent;
    border: 2px solid var(--primary, #6366f1);
    color: var(--primary, #6366f1);
    text-decoration: none;
    font-weight: 700;
    font-size: 0.875rem;
    transition: background 0.15s ease, color 0.15s ease;
}

.service-hash-link:hover {
    background: var(--primary, #6366f1);
    color: white;
}

.table-section {
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 1rem;
    background: var(--card-bg);
}

.table-heading {
    margin: 0;
    font-weight: 600;
    color: var(--text-primary);
}

.table-heading-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.general-service-rating {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.currently-using-cell {
    background: var(--card-bg);
}

.device-specific-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
}

.device-controls {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
}

.device-rating {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
    background: color-mix(in srgb, var(--success-color) 15%, transparent);
    color: var(--success-color);
}

.badge.medium {
    background: color-mix(in srgb, var(--warning-color) 15%, transparent);
    color: var(--warning-color);
}

.badge.poor {
    background: color-mix(in srgb, var(--danger-color) 15%, transparent);
    color: var(--danger-color);
}

.table-note {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
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
    justify-content: center;
    margin-top: 1.5rem;
}

.muted {
    color: var(--text-secondary);
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
    color: var(--danger-color);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.hint,
.confirm-hint {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

/* Mobile Cards View */
.mobile-cards-view {
    display: none;
}

.service-card {
    margin-bottom: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--card-bg);
    overflow: hidden;
}

.card-grid {
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-template-rows: auto auto;
    gap: 0;
}

.card-cell {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
}

.card-cell.category-cell {
    border-top: none;
    border-left: none;
    display: flex;
    align-items: center;
}

.card-cell.rating-cell {
    border-top: none;
    border-right: none;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0.5rem;
}

.card-cell.current-cell {
    border-bottom: none;
    border-left: none;
    min-width: 0;
}

.card-cell.recommended-cell {
    border-bottom: none;
    border-right: none;
    padding: 0.5rem;
    font-size: 0.8rem;
}

.cell-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.recommendation-text {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.3;
}

.empty-state-mobile {
    padding: 2rem;
    text-align: center;
}

@media (max-width: 768px) {
    .dashboard-metrics {
        grid-template-columns: 1fr;
    }

    /* Prevent horizontal overflow in all panels */
    .threat-model-panel,
    .save-data-panel,
    .score-panel,
    .priority-panel {
        overflow: hidden;
        max-width: 100%;
    }

    .heading-main {
        flex-direction: column;
        gap: 0.75rem;
    }

    .heading-title {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .heading-title .panel-title {
        width: 100%;
        margin-bottom: 0.25rem;
    }

    .status-tag {
        font-size: 0.65rem;
        padding: 0.15rem 0.5rem;
    }

    .reset-btn {
        margin-left: 0;
    }

    .subtext,
    .meta {
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    .save-data-panel .action-buttons {
        flex-direction: column;
        gap: 0.5rem;
    }

    .save-data-panel .action-buttons button {
        width: 100%;
    }

    .threat-body {
        grid-template-columns: 1fr;
    }

    .tierlist-column {
        padding: 0.75rem;
    }

    .device-specific-header,
    .answers-list {
        flex-direction: column;
        align-items: flex-start;
    }

    .answer-row {
        flex-direction: column;
        align-items: flex-start;
    }

    /* Hide desktop table, show mobile cards */
    .table-wrapper {
        display: none;
    }

    .mobile-cards-view {
        display: block;
    }

    .service-card {
        margin-bottom: 0.5rem;
    }

    .card-grid {
        grid-template-columns: 4fr 1fr;
    }

    .card-cell {
        padding: 0.5rem;
    }

    .card-cell.category-cell {
        padding: 0.5rem 0.4rem;
    }

    .card-cell.category-cell .category-link {
        font-size: 0.85rem;
    }

    .card-cell.rating-cell {
        padding: 0.35rem;
    }

    .card-cell.rating-cell .badge {
        font-size: 0.6rem;
        padding: 0.2rem 0.4rem;
    }

    .card-cell.current-cell {
        padding: 0.5rem 0.4rem;
    }

    .card-cell.recommended-cell {
        padding: 0.35rem;
        font-size: 0.75rem;
    }

    .cell-label {
        font-size: 0.6rem;
        margin-bottom: 0.25rem;
    }

    .recommendation-text {
        font-size: 0.75rem;
        line-height: 1.2;
    }

    .dashboard-banner {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        text-align: left;
    }

    .priority-flow {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    .priority-arrow {
        transform: rotate(90deg);
        align-self: center;
        margin: 0;
    }

    .mini-card {
        width: 100%;
        max-width: 100%;
    }

    .mini-card-name {
        white-space: normal;
        word-break: break-word;
    }

    .priority-item {
        overflow: hidden;
    }
}
</style>
