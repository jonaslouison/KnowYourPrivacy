<template>
  <div class="wiki-page container">
    <div class="wiki-header card">
      <div class="header-nav">
        <BaseButton v-if="hasQuizData" variant="outline" size="small" @click="goBack">
          ← Back to Dashboard
        </BaseButton>
        <BaseButton v-else variant="primary" size="small" @click="startQuiz">
          🎯 Start Quiz
        </BaseButton>
      </div>

      <div class="header-content">
        <div class="header-title">
          <span class="category-icon">{{ category?.icon }}</span>
          <div class="title-text">
            <h1>{{ category?.label }}</h1>
            <p class="subtitle">{{ category?.description }}</p>
          </div>
        </div>

        <div class="header-controls">
          <div class="control-group threat-model-control">
            <label class="control-label">Threat Model</label>
            <div class="threat-model-row">
              <BaseDropdown
                id="wiki-threat-level"
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

          <div class="control-group service-selection-group">
            <label class="control-label">Your Selection</label>
            <div class="selection-item">
              <SelectionFlow
                :current-name="currentServiceInfo?.name"
                :current-rating="currentServiceRating"
                :recommended-name="recommendedService?.name"
                @current-click="currentServiceInfo && scrollToService(currentServiceInfo.id)"
                @recommended-click="recommendedService && scrollToService(recommendedService.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="wiki-content">
      <!-- Mobile Categories Toggle -->
      <button class="mobile-categories-toggle" @click="mobileCategoriesOpen = !mobileCategoriesOpen">
        <span class="toggle-icon">{{ mobileCategoriesOpen ? '✕' : '☰' }}</span>
        <span class="toggle-text">{{ mobileCategoriesOpen ? 'Close' : 'Categories' }}</span>
      </button>

      <!-- Mobile Backdrop -->
      <div 
        v-if="mobileCategoriesOpen" 
        class="mobile-categories-backdrop" 
        @click="mobileCategoriesOpen = false"
      ></div>

      <!-- Categories Sidebar (Left) -->
      <aside class="categories-sidebar card" :class="{ open: mobileCategoriesOpen }">
        <h3>Categories</h3>
        <nav class="category-nav">
          <div class="category-section">
            <span class="section-label">General Services</span>
            <BaseButton
              v-for="cat in generalCategories"
              :key="cat.id"
              :variant="categoryId === cat.id ? 'primary' : 'ghost'"
              size="small"
              class="category-nav-button"
              :class="{ active: categoryId === cat.id }"
              @click="navigateToCategory(cat.id)"
            >
              <span class="category-nav-icon">{{ cat.icon }}</span>
              {{ cat.label }}
            </BaseButton>
          </div>
          <div class="category-section">
            <span class="section-label">Device Specific</span>
            <BaseButton
              v-for="cat in deviceCategories"
              :key="cat.id"
              :variant="categoryId === cat.id ? 'primary' : 'ghost'"
              size="small"
              class="category-nav-button"
              :class="{ active: categoryId === cat.id }"
              @click="navigateToCategory(cat.id)"
            >
              <span class="category-nav-icon">{{ cat.icon }}</span>
              {{ cat.label }}
            </BaseButton>
          </div>
          <div class="category-section">
            <span class="section-label">Operating Systems</span>
            <BaseButton
              v-for="cat in osCategories"
              :key="cat.id"
              :variant="categoryId === cat.id ? 'primary' : 'ghost'"
              size="small"
              class="category-nav-button"
              :class="{ active: categoryId === cat.id }"
              @click="navigateToCategory(cat.id)"
            >
              <span class="category-nav-icon">{{ cat.icon }}</span>
              {{ cat.label }}
            </BaseButton>
          </div>
        </nav>
      </aside>

      <main class="wiki-articles">
        <section class="intro-section card" v-if="category?.intro">
          <div class="intro-header">
            <div class="intro-text">
              <h2 class="intro-title">{{ category.intro.title }}</h2>
              <p class="intro-description">{{ category.intro.description }}</p>
            </div>
            <BaseButton
              v-if="category?.privacyGuidesUrl"
              variant="outline"
              size="small"
              :href="category.privacyGuidesUrl"
              target="_blank"
              class="privacy-guides-btn"
            >
              📘 Privacy Guides →
            </BaseButton>
          </div>
          
          <div class="intro-grid">
            <div class="intro-block concerns">
              <h4>{{ category.intro.concerns.heading }}</h4>
              <ul>
                <li v-for="point in category.intro.concerns.points" :key="point">{{ point }}</li>
              </ul>
            </div>
            <div class="intro-block benefits">
              <h4>{{ category.intro.benefits.heading }}</h4>
              <ul>
                <li v-for="point in category.intro.benefits.points" :key="point">{{ point }}</li>
              </ul>
            </div>
          </div>
        </section>

        <article
          v-for="service in sortedServices"
          :key="service.id"
          :id="service.id"
          class="service-article card"
          :class="[
            `rating-${service.privacyRating}`,
            { 'is-recommended': service.id === recommendedService?.id }
          ]"
        >
          <div class="article-header">
            <div class="header-left">
              <h2 class="service-title">{{ service.name }}</h2>
              <span v-if="service.id === recommendedService?.id" class="rec-badge">⭐ Recommended</span>
              <span 
                class="privacy-badge" 
                :style="{ backgroundColor: getPrivacyRatingColor(service.privacyRating) }"
              >
                {{ getPrivacyRatingLabel(service.privacyRating) }}
              </span>
              <span v-if="service.privacyGuidesRecommended" class="pg-badge" title="Recommended by Privacy Guides">📘</span>
            </div>
            <div class="header-right">
              <BaseButton
                v-if="!isCurrentlyUsing(service.id)"
                variant="secondary"
                size="small"
                @click="setCurrentService(service.id, service.name)"
              >
                I use this
              </BaseButton>
              <span v-else class="using-badge">✓ Using</span>
              <BaseButton
                v-if="service.homepage"
                variant="outline"
                size="small"
                :href="service.homepage"
                target="_blank"
              >
                🔗 Website
              </BaseButton>
              <BaseButton
                v-if="getPrivacyGuidesUrl(service)"
                variant="outline"
                size="small"
                :href="getPrivacyGuidesUrl(service)!"
                target="_blank"
                class="pg-link-btn"
              >
                📘 Privacy Guides
              </BaseButton>
            </div>
          </div>
          
          <p class="service-description">{{ service.description }}</p>
          
          <details class="privacy-details">
            <summary><strong>Privacy:</strong> {{ service.privacyNote }}</summary>
            <ul>
              <li v-for="detail in service.privacyDetails" :key="detail">{{ detail }}</li>
            </ul>
          </details>
        </article>
      </main>

      <!-- Services Sidebar (Right) -->
      <aside class="services-sidebar card">
        <h3>Services</h3>
        <nav class="service-nav">
          <BaseButton
            v-for="service in sortedServices"
            :key="service.id"
            :variant="activeServiceId === service.id ? 'primary' : 'ghost'"
            size="small"
            class="service-nav-button"
            :class="{ 
              active: activeServiceId === service.id,
              [`rating-${service.privacyRating}`]: true
            }"
            @click="scrollToService(service.id)"
          >
            <span class="service-nav-indicator" :class="`rating-${service.privacyRating}`"></span>
            {{ service.name }}
          </BaseButton>
        </nav>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseDropdown from '../components/BaseDropdown.vue'
import SelectionFlow from '../components/SelectionFlow.vue'
import type { RatingClass } from '../components/SelectionFlow.vue'
import { useQuizStore } from '../stores/quiz'
import { showToast } from '../utils/toast'
import { getWikiCategory, getPrivacyRatingColor, getPrivacyRatingLabel, WIKI_CATEGORIES, type WikiCategory, type WikiService } from '../data/wiki'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()
const activeServiceId = ref<string | null>(null)
const mobileCategoriesOpen = ref(false)

// Navigate to category and close mobile menu
const navigateToCategory = (catId: string) => {
  mobileCategoriesOpen.value = false
  router.push(`/wiki/${catId}`)
}

// Get category from route param
const categoryId = computed(() => route.params.category as string)
const category = computed<WikiCategory | undefined>(() => getWikiCategory(categoryId.value))

// Category navigation - ordered to match Dashboard tables
const GENERAL_CATEGORY_IDS = ['email', 'cloud', 'passwords', 'vpn', 'messaging']
const DEVICE_CATEGORY_IDS = ['desktop-browsers', 'mobile-browsers', 'search-engines']
const OS_CATEGORY_IDS = ['desktop-os', 'mobile-os', 'tablet-os']

const generalCategories = computed(() => 
  GENERAL_CATEGORY_IDS
    .map(id => WIKI_CATEGORIES.find(c => c.id === id))
    .filter((c): c is WikiCategory => c !== undefined)
)

const deviceCategories = computed(() =>
  DEVICE_CATEGORY_IDS
    .map(id => WIKI_CATEGORIES.find(c => c.id === id))
    .filter((c): c is WikiCategory => c !== undefined)
)

const osCategories = computed(() =>
  OS_CATEGORY_IDS
    .map(id => WIKI_CATEGORIES.find(c => c.id === id))
    .filter((c): c is WikiCategory => c !== undefined)
)

// Threat model
const displayThreatLevel = computed(() => quizStore.displayThreatLevel)
const threatLevelOptions = computed(() => quizStore.threatSpectrumOptions)
const threatLevelDropdownOptions = computed(() =>
  threatLevelOptions.value.map((option) => ({
    value: option.level,
    label: `Level ${option.level} · ${option.label}`
  }))
)
const manualOverride = computed(() => quizStore.manualOverride)
const manualTagLabel = computed(() => (manualOverride.value ? 'Manual' : 'Computed'))

const handleThreatLevelChange = (value: string | number) => {
  quizStore.setManualThreatLevel(Number(value))
}

const resetThreatLevel = () => {
  quizStore.resetManualThreatLevel()
}

// Current service selection
const currentAnswer = computed(() => {
  if (!category.value) return ''
  const answer = quizStore.getAnswer(category.value.questionId)
  return Array.isArray(answer) ? answer[0] : (answer || '')
})

// Get the current service object based on user's answer
const currentServiceInfo = computed(() => {
  if (!category.value || !currentAnswer.value) return null
  // Try to find the service in the category that matches the answer
  const answer = currentAnswer.value.toLowerCase()
  return category.value.services.find(service => 
    service.id.toLowerCase().includes(answer.split('-')[0]) ||
    answer.includes(service.id.toLowerCase().split('-')[0]) ||
    service.name.toLowerCase().includes(answer.replace(/-/g, ' '))
  ) || null
})

// Map wiki privacyRating to SelectionFlow rating class
const currentServiceRating = computed<RatingClass | undefined>(() => {
  const rating = currentServiceInfo.value?.privacyRating
  if (!rating) return undefined
  if (rating === 'good' || rating === 'recommended') return 'good'
  if (rating === 'acceptable' || rating === 'caution') return 'medium'
  return 'poor' // 'avoid'
})

// Recommended service based on threat level
// ONLY recommends privacy-respecting services (rating: 'recommended')
// Matches difficulty level to threat model:
// - Level 1 (Normie): difficulty 1 (easy to use) - e.g., Proton Pass
// - Level 2 (Aware): difficulty 1-2 (balanced) - e.g., 1Password
// - Level 3 (Activist): difficulty 2 (balanced security) - e.g., KeePassXC
// - Level 4 (Ghost): difficulty 3 (maximum security) - e.g., Bitwarden self-hosted
const recommendedService = computed<WikiService | null>(() => {
  if (!category.value) return null
  const threatLevel = displayThreatLevel.value
  
  // ONLY consider services that are privacy-respecting (good rating)
  const privacyServices = category.value.services.filter(
    service => service.privacyRating === 'good' && service.difficulty !== undefined
  )
  
  if (privacyServices.length === 0) return null
  
  // Determine target difficulty based on threat level
  // Higher threat = prefer higher difficulty (more secure options)
  let targetDifficulty: number
  if (threatLevel >= 4) {
    // Ghost - maximum security, prefer difficulty 3
    targetDifficulty = 3
  } else if (threatLevel === 3) {
    // Activist - balanced advanced, prefer difficulty 2
    targetDifficulty = 2
  } else if (threatLevel === 2) {
    // Aware - balanced, prefer difficulty 1-2
    targetDifficulty = 2
  } else {
    // Normie - easiest options
    targetDifficulty = 1
  }
  
  // Find service matching target difficulty, or closest lower difficulty
  const exactMatch = privacyServices.find(s => s.difficulty === targetDifficulty)
  if (exactMatch) return exactMatch
  
  // Find closest match (prefer higher difficulty for higher threat levels)
  const sortedByDifficulty = [...privacyServices].sort((a, b) => {
    const aDiff = Math.abs((a.difficulty || 1) - targetDifficulty)
    const bDiff = Math.abs((b.difficulty || 1) - targetDifficulty)
    if (aDiff !== bDiff) return aDiff - bDiff
    // For equal distance, prefer higher difficulty for higher threat levels
    if (threatLevel >= 3) return (b.difficulty || 1) - (a.difficulty || 1)
    return (a.difficulty || 1) - (b.difficulty || 1)
  })
  
  return sortedByDifficulty[0] || null
})

// Sorted services: recommendation first, then all green (good), then acceptable, then caution, then red (avoid)
const RATING_ORDER: Record<string, number> = {
  'good': 0,         // green
  'acceptable': 1,   // yellow - acceptable before caution
  'caution': 2,      // orange
  'avoid': 3         // red
}

const sortedServices = computed(() => {
  if (!category.value) return []
  
  const services = [...category.value.services]
  const recId = recommendedService.value?.id
  
  return services.sort((a, b) => {
    // Personal recommendation always first
    if (a.id === recId) return -1
    if (b.id === recId) return 1
    
    // Then sort by rating tier
    const aOrder = RATING_ORDER[a.privacyRating] ?? 99
    const bOrder = RATING_ORDER[b.privacyRating] ?? 99
    if (aOrder !== bOrder) return aOrder - bOrder
    
    // Within same tier, sort alphabetically
    return a.name.localeCompare(b.name)
  })
})

// Check if a service is currently being used
const isCurrentlyUsing = (serviceId: string): boolean => {
  const current = currentAnswer.value.toLowerCase()
  return current.includes(serviceId.toLowerCase().split('-')[0])
}

// Set a service as current
const setCurrentService = (serviceId: string, serviceName: string) => {
  if (!category.value) return
  // Find matching option value from the question options
  const question = quizStore.questions.find(q => q.id === category.value!.questionId)
  if (!question) {
    showToast('Could not find matching question', 'warning')
    return
  }
  
  // Try to find a matching option with multiple strategies
  const serviceIdLower = serviceId.toLowerCase()
  const serviceNameLower = serviceName.toLowerCase()
  const serviceFirstWord = serviceNameLower.split(' ')[0].replace(/[^a-z]/g, '')
  
  // Create normalized versions for matching
  const normalizedServiceId = serviceIdLower.replace(/[-_]/g, '').replace(/hardened|default|mobile/g, '')
  
  const matchingOption = question.options.find(opt => {
    const optLabel = opt.label.toLowerCase()
    const optValue = opt.value.toLowerCase()
    const normalizedOptValue = optValue.replace(/[-_]/g, '')
    
    // Exact match on value
    if (optValue === serviceIdLower) return true
    // Normalized match (firefox-hardened matches firefox)
    if (normalizedOptValue === normalizedServiceId) return true
    if (normalizedServiceId.includes(normalizedOptValue)) return true
    if (normalizedOptValue.includes(normalizedServiceId)) return true
    // Value contains service ID base part
    const serviceIdBase = serviceIdLower.split('-')[0]
    if (optValue === serviceIdBase || optValue.includes(serviceIdBase)) return true
    // Label contains service name or first word
    if (optLabel.includes(serviceFirstWord) && serviceFirstWord.length > 2) return true
    // Service first word matches option value
    if (optValue.includes(serviceFirstWord) && serviceFirstWord.length > 2) return true
    // Handle special mappings
    if (serviceIdLower.includes('proton') && optValue.includes('proton')) return true
    if (serviceIdLower.includes('nextcloud') && optValue.includes('nextcloud')) return true
    if (serviceIdLower.includes('bitwarden') && optValue.includes('bitwarden')) return true
    if (serviceIdLower.includes('librewolf') && optValue === 'firefox') return true
    
    return false
  })
  
  if (matchingOption) {
    quizStore.saveAnswer({ questionId: category.value.questionId, answer: matchingOption.value })
    showToast(`Set ${serviceName} as current`, 'success')
  } else {
    // If no match found, try privacy-focused other option first
    const privacyOtherOption = question.options.find(opt => opt.value.toLowerCase() === 'other-privacy')
    if (privacyOtherOption) {
      quizStore.saveAnswer({ questionId: category.value.questionId, answer: privacyOtherOption.value })
      showToast(`Set ${serviceName} as current`, 'success')
    } else {
      // Fallback to any other option
      const otherOption = question.options.find(opt => opt.value.toLowerCase().includes('other'))
      if (otherOption) {
        quizStore.saveAnswer({ questionId: category.value.questionId, answer: otherOption.value })
        showToast(`Set ${serviceName} as current`, 'success')
      } else {
        showToast('Could not find matching option for this service', 'warning')
      }
    }
  }
}

// Scroll to service section
const scrollToService = (serviceId: string) => {
  activeServiceId.value = serviceId
  const element = document.getElementById(serviceId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  // Update URL hash without triggering navigation
  window.history.replaceState(null, '', `#/wiki/${categoryId.value}#${serviceId}`)
}

// Navigation
const hasQuizData = computed(() => quizStore.isCompleted || quizStore.isLoadedFromFile || quizStore.answers.length > 0)

const goBack = () => {
  router.push('/dashboard')
}

const startQuiz = () => {
  router.push('/quiz')
}

// Generate Privacy Guides URL for a service with optional anchor
const getPrivacyGuidesUrl = (service: WikiService): string | null => {
  if (!category.value?.privacyGuidesUrl) return null
  
  // If service has a specific Privacy Guides ID, append it as anchor
  if (service.privacyGuidesId) {
    return `${category.value.privacyGuidesUrl}#${service.privacyGuidesId}`
  }
  
  // Fall back to category URL without anchor
  return category.value.privacyGuidesUrl
}

// Handle initial hash on mount
onMounted(() => {
  // Add class to enable sticky sidebars (overrides global overflow-x: hidden)
  document.documentElement.classList.add('wiki-page-active')
  
  const hash = window.location.hash
  const serviceHash = hash.split('#').pop()
  if (serviceHash && serviceHash !== categoryId.value && category.value?.services.some(s => s.id === serviceHash)) {
    setTimeout(() => scrollToService(serviceHash), 100)
  }
})

// Clean up on unmount
onUnmounted(() => {
  document.documentElement.classList.remove('wiki-page-active')
})

// Redirect if category not found
watch(category, (cat) => {
  if (categoryId.value && !cat) {
    router.push('/dashboard')
  }
}, { immediate: true })
</script>

<style scoped>
.wiki-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  overflow: visible;
}

.wiki-header {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.header-nav {
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-icon {
  font-size: 2.5rem;
}

.title-text h1 {
  margin: 0;
  font-size: 1.75rem;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted);
}

.header-controls {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group.threat-model-control {
  min-width: 280px;
}

.threat-model-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
}

.status-tag {
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
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
  flex-shrink: 0;
}

.control-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

/* Service selection matching Dashboard priority-item */
.service-selection-group {
  min-width: 0;
  width: 100%;
}

.selection-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--primary-color);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--card-bg);
}

/* mini-card styles are in SelectionFlow.vue component */

.wiki-content {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  gap: 1.5rem;
  align-items: start;
  position: relative;
}

/* Categories Sidebar (Left) */
.categories-sidebar {
  position: sticky;
  top: 5rem;
  padding: 1rem;
  align-self: flex-start;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  height: fit-content;
}

.categories-sidebar h3 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.category-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
}

.category-nav-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.category-nav-button:not(.active):hover {
  background: var(--color-bg-hover, rgba(99, 102, 241, 0.1));
}

.category-nav-button.active {
  font-weight: 600;
}

.category-nav-icon {
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
}

/* Services Sidebar (Right) */
.services-sidebar {
  position: sticky;
  top: 5rem;
  padding: 1rem;
  align-self: flex-start;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  height: fit-content;
}

.services-sidebar h3 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.service-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.service-nav-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.service-nav-button:not(.active):hover {
  background: var(--color-bg-hover, rgba(99, 102, 241, 0.1));
}

.service-nav-button.active {
  font-weight: 600;
}

.service-nav-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.service-nav-indicator.rating-good {
  background-color: #22c55e;
}

.service-nav-indicator.rating-acceptable {
  background-color: #eab308;
}

.service-nav-indicator.rating-caution {
  background-color: #f97316;
}

.service-nav-indicator.rating-avoid {
  background-color: #ef4444;
}

.wiki-articles {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.intro-section {
  padding: 1.25rem;
}

.intro-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.intro-text {
  flex: 1;
}

.intro-title {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #111827);
}

.intro-description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary, #6b7280);
}

.privacy-guides-btn {
  flex-shrink: 0;
}

.intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.intro-block {
  padding: 1rem;
  border-radius: 10px;
}

.intro-block.concerns {
  background: color-mix(in srgb, var(--danger-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger-color) 15%, transparent);
}

.intro-block.benefits {
  background: color-mix(in srgb, var(--success-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--success-color) 15%, transparent);
}

.intro-block h4 {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.intro-block.concerns h4 {
  color: var(--danger-color);
}

.intro-block.benefits h4 {
  color: var(--success-color);
}

.intro-block ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.intro-block li {
  position: relative;
  padding-left: 1rem;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--text-secondary, #6b7280);
}

.intro-block li:last-child {
  margin-bottom: 0;
}

.intro-block li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.intro-block.concerns li::before {
  background-color: #ef4444;
}

.intro-block.benefits li::before {
  background-color: #22c55e;
}

.service-article {
  padding: 1rem 1.25rem;
  scroll-margin-top: 6rem;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.service-article.is-recommended {
  background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
  border-left: 4px solid var(--primary-color);
}

.rec-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, var(--color-primary, #6366f1), #8b5cf6);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.service-article.rating-good:not(.is-recommended) {
  border-left-color: #22c55e;
}

.service-article.rating-acceptable {
  border-left-color: #eab308;
}

.service-article.rating-caution {
  border-left-color: #f97316;
}

.service-article.rating-avoid {
  border-left-color: #ef4444;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.75rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: 0;
}

.service-title {
  margin: 0;
  font-size: 1.1rem;
  white-space: nowrap;
}

.privacy-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.pg-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: #3b82f6;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.privacy-details {
  margin: 0.5rem 0 0;
  padding: 0;
}

.privacy-details summary {
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  padding: 0.25rem 0;
}

.privacy-details summary:hover {
  color: var(--color-primary);
}

.privacy-details summary strong {
  color: var(--color-text);
}

.privacy-details[open] summary {
  margin-bottom: 0.5rem;
}

.privacy-details ul {
  margin: 0;
  padding-left: 1.25rem;
}

.privacy-details li {
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.service-description {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text);
}

.using-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: color-mix(in srgb, var(--success-color) 15%, transparent);
  color: var(--success-color);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Mobile Categories Toggle */
.mobile-categories-toggle {
  display: none;
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  align-items: center;
  gap: 0.5rem;
}

.mobile-categories-toggle:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 1100px) {
  .wiki-content {
    grid-template-columns: 180px 1fr;
  }

  .services-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .wiki-content {
    grid-template-columns: 1fr;
    position: relative;
  }

  .mobile-categories-toggle {
    display: flex;
  }

  .categories-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    z-index: 99;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    box-shadow: none;
  }

  .categories-sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  }

  .mobile-categories-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 98;
  }

  .services-sidebar {
    display: none;
  }

  .header-content {
    flex-direction: column;
  }

  .header-controls {
    width: 100%;
  }

  .category-nav-button {
    font-size: 0.9rem;
  }

  /* Mobile article header fixes */
  .article-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .header-left {
    flex-wrap: wrap;
    gap: 0.35rem;
    width: 100%;
  }

  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .service-title {
    width: 100%;
    white-space: normal;
    word-break: break-word;
    font-size: 1rem;
  }

  .rec-badge,
  .privacy-badge,
  .pg-badge,
  .using-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    white-space: nowrap;
  }

  /* Mobile selection styling */
  .selection-flow {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .selection-arrow {
    transform: rotate(90deg);
    align-self: center;
  }

  .mini-card {
    width: 100%;
  }

  .mini-card-name {
    white-space: normal;
    word-break: break-word;
  }
}

@media (max-width: 600px) {
  .wiki-page {
    padding: 1rem;
  }

  .header-controls {
    flex-direction: column;
  }

  .control-group {
    width: 100%;
  }
}
</style>

<!-- Unscoped styles to override global overflow that breaks sticky -->
<style>
html.wiki-page-active,
html.wiki-page-active body,
html.wiki-page-active #app {
  overflow: visible !important;
  overflow-x: clip !important;
}
</style>
