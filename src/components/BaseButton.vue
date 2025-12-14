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
