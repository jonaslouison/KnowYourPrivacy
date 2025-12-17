<template>
    <div class="tooltip-wrapper" @mouseenter="show = true" @mouseleave="show = false">
        <button type="button" class="tooltip-trigger" :aria-label="ariaLabel">
            <span class="tooltip-icon">?</span>
        </button>
        <Transition name="tooltip-fade">
            <div v-if="show" class="tooltip-content" :class="position">
                <slot>{{ text }}</slot>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
    text?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    ariaLabel?: string
}>()

const show = ref(false)
</script>

<style scoped>
.tooltip-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.tooltip-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 1.5px solid var(--primary-color);
    background: transparent;
    color: var(--primary-color);
    font-size: 0.7rem;
    font-weight: 700;
    cursor: help;
    transition: all 0.15s ease;
    padding: 0;
    line-height: 1;
}

.tooltip-trigger:hover {
    background: var(--primary-color);
    color: white;
}

.tooltip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.tooltip-content {
    position: absolute;
    z-index: 1000;
    min-width: 200px;
    max-width: 280px;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius, 8px);
    background: var(--text-primary, #111827);
    color: white;
    font-size: 0.8rem;
    line-height: 1.5;
    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    pointer-events: none;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
}

/* Position variants */
.tooltip-content.top,
.tooltip-content:not(.bottom):not(.left):not(.right) {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
}

.tooltip-content.bottom {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
}

.tooltip-content.left {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
}

.tooltip-content.right {
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
}

/* Arrow styling via pseudo-element */
.tooltip-content::after {
    content: '';
    position: absolute;
    border: 6px solid transparent;
}

.tooltip-content.top::after,
.tooltip-content:not(.bottom):not(.left):not(.right)::after {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: var(--text-primary, #111827);
}

.tooltip-content.bottom::after {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: var(--text-primary, #111827);
}

.tooltip-content.left::after {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: var(--text-primary, #111827);
}

.tooltip-content.right::after {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: var(--text-primary, #111827);
}

/* Transition */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
}

.tooltip-fade-enter-from.top,
.tooltip-fade-leave-to.top,
.tooltip-fade-enter-from:not(.bottom):not(.left):not(.right),
.tooltip-fade-leave-to:not(.bottom):not(.left):not(.right) {
    transform: translateX(-50%) translateY(4px);
}

.tooltip-fade-enter-from.bottom,
.tooltip-fade-leave-to.bottom {
    transform: translateX(-50%) translateY(-4px);
}
</style>
