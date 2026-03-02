<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

export type RatingClass = 'good' | 'medium' | 'poor'

withDefaults(defineProps<{
    currentName?: string
    currentLabel?: string
    currentTo?: RouteLocationRaw
    currentRating?: RatingClass
    recommendedName?: string
    recommendedLabel?: string
    recommendedTo?: RouteLocationRaw
    emptyCurrentText?: string
    emptyRecommendedText?: string
}>(), {
    currentLabel: 'Current',
    recommendedLabel: 'Recommended',
    emptyCurrentText: 'Not selected',
    emptyRecommendedText: 'Complete quiz',
})

const emit = defineEmits<{
    currentClick: []
    recommendedClick: []
}>()
</script>

<template>
    <div class="selection-flow">
        <component :is="currentTo ? 'router-link' : 'div'" v-bind="currentTo ? { to: currentTo } : {}"
            class="mini-card current" :class="[
                currentRating ? `rating-${currentRating}` : '',
                { empty: !currentName }
            ]" @click="emit('currentClick')">
            <span class="mini-card-label">{{ currentLabel }}</span>
            <span class="mini-card-name">{{ currentName || emptyCurrentText }}</span>
        </component>
        <span class="selection-arrow">→</span>
        <component :is="recommendedTo ? 'router-link' : 'div'" v-bind="recommendedTo ? { to: recommendedTo } : {}"
            class="mini-card recommended" :class="{ empty: !recommendedName }" @click="emit('recommendedClick')">
            <span class="mini-card-label">{{ recommendedLabel }}</span>
            <span class="mini-card-name">{{ recommendedName || emptyRecommendedText }}</span>
        </component>
    </div>
</template>

<style scoped>
.selection-flow {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.mini-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s ease;
    min-width: 0;
    cursor: pointer;
}

.mini-card:hover:not(.empty) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mini-card.empty {
    opacity: 0.6;
    cursor: default;
}

/* Current card — neutral by default, colored when rated */
.mini-card.current {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
}

.mini-card.current.rating-poor {
    background: color-mix(in srgb, var(--danger-color) 10%, transparent);
    border-color: var(--danger-color);
}

.mini-card.current.rating-medium {
    background: color-mix(in srgb, var(--warning-color) 10%, transparent);
    border-color: var(--warning-color);
}

.mini-card.current.rating-good {
    background: color-mix(in srgb, var(--success-color) 10%, transparent);
    border-color: var(--success-color);
}

/* Recommended card — always green tint */
.mini-card.recommended {
    background: color-mix(in srgb, var(--success-color) 15%, transparent);
    border: 1px solid var(--success-color);
}

/* Labels */
.mini-card-label {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
}

/* Names — always use standard text color */
.mini-card-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.selection-arrow {
    font-size: 1.25rem;
    color: var(--text-secondary);
    flex-shrink: 0;
}
</style>
