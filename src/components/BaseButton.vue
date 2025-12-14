<template>
    <button
        :type="buttonType"
        :class="buttonClasses"
        :disabled="disabled"
        @click="$emit('click', $event)"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

const props = defineProps({
    variant: {
        type: String as PropType<'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'>,
        default: 'primary'
    },
    size: {
        type: String as PropType<'medium' | 'small'>,
        default: 'medium'
    },
    disabled: Boolean,
    type: {
        type: String as PropType<'button' | 'submit' | 'reset'>,
        default: 'button'
    }
})

defineEmits<{ (e: 'click', payload: MouseEvent): void }>()

const buttonClasses = computed(() => [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    { 'is-disabled': props.disabled }
])

const buttonType = computed(() => props.type)
</script>

<style scoped>
.base-button {
    border: none;
    border-radius: var(--border-radius);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
}

.base-button.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.base-button--primary {
    background: var(--primary-color);
    color: #fff;
}

.base-button--secondary {
    background: var(--secondary-color);
    color: #fff;
}

.base-button--danger {
    background: var(--danger-color);
    color: #fff;
}

.base-button--outline {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
}

.base-button--ghost {
    background: transparent;
    color: var(--text-secondary);
}

.base-button--small {
    padding: var(--spacing-xxs) var(--spacing-sm);
    font-size: var(--font-size-small);
}

.base-button:not(.is-disabled):hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
}
</style>
