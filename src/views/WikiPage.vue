<template>
  <div class="wiki-page container">
    <div class="wiki-header card">
      <div class="header-nav">
        <BaseButton variant="outline" size="small" @click="goBack">
          ← Back to Dashboard
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
          <div class="control-group">
            <label class="control-label">Threat Model</label>
            <BaseDropdown
              id="wiki-threat-level"
              :model-value="displayThreatLevel"
              :options="threatLevelDropdownOptions"
              @update:modelValue="handleThreatLevelChange"
            />
          </div>

          <div class="control-group">
            <label class="control-label">Currently Using</label>
            <BaseDropdown
              :model-value="currentAnswer"
              :options="currentServiceOptions"
              placeholder="Not selected"
              @update:modelValue="handleServiceChange"
            />
          </div>

          <div class="control-group recommended-group">
            <label class="control-label">Recommended</label>
            <div class="recommended-service">
              <span class="recommended-name">{{ recommendedService?.name || 'Complete quiz for recommendation' }}</span>
              <span v-if="recommendedService" class="recommended-badge">
                Based on {{ displayThreatLabel }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="wiki-content">
      <aside class="wiki-sidebar card">
        <h3>Services</h3>
        <nav class="service-nav">
          <a
            v-for="service in category?.services"
            :key="service.id"
            :href="`#${service.id}`"
            class="service-nav-item"
            :class="{ active: activeServiceId === service.id }"
            @click.prevent="scrollToService(service.id)"
          >
            {{ service.name }}
          </a>
        </nav>
      </aside>

      <main class="wiki-articles">
        <section class="intro-section card">
          <div class="markdown-content" v-html="renderedIntroContent"></div>
        </section>

        <section
          v-for="service in category?.services"
          :key="service.id"
          :id="service.id"
          class="service-article card"
        >
          <div class="article-header">
            <h2 class="service-title">{{ service.name }}</h2>
            <div class="article-actions">
              <a
                v-if="service.homepage"
                :href="service.homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="external-link"
              >
                🔗 Homepage
              </a>
            </div>
          </div>
          <p class="service-description">{{ service.description }}</p>
          <div class="service-actions">
            <BaseButton
              v-if="!isCurrentlyUsing(service.id)"
              variant="primary"
              size="small"
              @click="setCurrentService(service.id, service.name)"
            >
              Set as current
            </BaseButton>
            <span v-else class="using-badge">✓ Currently using</span>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BaseDropdown from '../components/BaseDropdown.vue'
import { useQuizStore } from '../stores/quiz'
import { getWikiCategory, type WikiCategory, type WikiService } from '../data/wiki'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()
const activeServiceId = ref<string | null>(null)

// Get category from route param
const categoryId = computed(() => route.params.category as string)
const category = computed<WikiCategory | undefined>(() => getWikiCategory(categoryId.value))

// Threat model
const displayThreatLevel = computed(() => quizStore.displayThreatLevel)
const displayThreatLabel = computed(() => quizStore.displayThreatSpectrumInfo.label)
const threatLevelOptions = computed(() => quizStore.threatSpectrumOptions)
const threatLevelDropdownOptions = computed(() =>
  threatLevelOptions.value.map((option) => ({
    value: option.level,
    label: `Level ${option.level} · ${option.label}`
  }))
)

const handleThreatLevelChange = (value: string | number) => {
  quizStore.setManualThreatLevel(Number(value))
}

// Current service selection
const currentAnswer = computed(() => {
  if (!category.value) return ''
  const answer = quizStore.getAnswer(category.value.questionId)
  return Array.isArray(answer) ? answer[0] : (answer || '')
})

const currentServiceOptions = computed(() => {
  if (!category.value) return []
  const question = quizStore.questions.find(q => q.id === category.value!.questionId)
  if (!question) return []
  return question.options.map(opt => ({
    value: opt.value,
    label: opt.label
  }))
})

const handleServiceChange = (value: string | number) => {
  if (!category.value) return
  quizStore.saveAnswer({ questionId: category.value.questionId, answer: String(value) })
}

// Recommended service based on threat level
const recommendedService = computed<WikiService | null>(() => {
  if (!category.value) return null
  const threatLevel = displayThreatLevel.value
  // Higher threat levels get higher-ranked services (first in list = best)
  // For now, recommend the first service as our top pick
  const services = category.value.services
  if (threatLevel >= 3) {
    // Ghost/Activist - recommend first (most private) option
    return services[0] || null
  } else if (threatLevel === 2) {
    // Aware - still recommend top options
    return services[0] || null
  }
  // Normie - recommend easier options (second in list if available)
  return services[1] || services[0] || null
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
  if (!question) return
  
  // Try to find a matching option
  const matchingOption = question.options.find(opt => 
    opt.label.toLowerCase().includes(serviceName.toLowerCase().split(' ')[0]) ||
    opt.value.toLowerCase().includes(serviceId.split('-')[0])
  )
  
  if (matchingOption) {
    quizStore.saveAnswer({ questionId: category.value.questionId, answer: matchingOption.value })
  }
}

// Render markdown content (simple implementation)
const renderedIntroContent = computed(() => {
  if (!category.value) return ''
  // Simple markdown to HTML conversion
  return category.value.content
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|l])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h(\d)><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
})

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
const goBack = () => {
  router.push('/dashboard')
}

// Handle initial hash on mount
onMounted(() => {
  const hash = window.location.hash
  const serviceHash = hash.split('#').pop()
  if (serviceHash && serviceHash !== categoryId.value && category.value?.services.some(s => s.id === serviceHash)) {
    setTimeout(() => scrollToService(serviceHash), 100)
  }
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

.control-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.recommended-group {
  min-width: 200px;
}

.recommended-service {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recommended-name {
  font-weight: 600;
  color: var(--color-text);
}

.recommended-badge {
  font-size: 0.75rem;
  color: var(--color-primary);
}

.wiki-content {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.wiki-sidebar {
  position: sticky;
  top: 1rem;
  padding: 1rem;
}

.wiki-sidebar h3 {
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

.service-nav-item {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
}

.service-nav-item:hover {
  background: var(--color-bg-hover);
}

.service-nav-item.active {
  background: var(--color-primary);
  color: white;
}

.wiki-articles {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.intro-section {
  padding: 1.5rem;
}

.markdown-content h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.markdown-content h3 {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.125rem;
}

.markdown-content p {
  margin: 0 0 1rem;
  line-height: 1.6;
}

.markdown-content ul {
  margin: 0 0 1rem;
  padding-left: 1.5rem;
}

.markdown-content li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.service-article {
  padding: 1.5rem;
  scroll-margin-top: 1rem;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.service-title {
  margin: 0;
  font-size: 1.25rem;
}

.external-link {
  font-size: 0.875rem;
  color: var(--color-primary);
  text-decoration: none;
}

.external-link:hover {
  text-decoration: underline;
}

.service-description {
  margin: 0 0 1rem;
  line-height: 1.6;
  color: var(--color-text);
}

.service-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.using-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-success-bg, #d4edda);
  color: var(--color-success, #155724);
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 900px) {
  .wiki-content {
    grid-template-columns: 1fr;
  }

  .wiki-sidebar {
    position: static;
    display: none;
  }

  .header-content {
    flex-direction: column;
  }

  .header-controls {
    width: 100%;
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
