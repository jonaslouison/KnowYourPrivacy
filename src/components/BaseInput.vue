<template>
    <div :class="['base-input-wrapper', { 'base-input-wrapper--full': fullWidth }]">
        <label v-if="label" :for="id" class="base-input-label">{{ label }}</label>
        <input
            :id="id"
            :type="inputType"
            :placeholder="placeholder"
            :value="modelValue"
            class="base-input"
            @input="onInput"
            ref="inputRef"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number] as PropType<string | number>,
        default: ''
    },
    type: {
        type: String as PropType<'text' | 'password' | 'email' | 'number'>,
        default: 'text'
    },
    placeholder: String,
    label: String,
    id: String,
    fullWidth: Boolean
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()

const inputType = props.type

const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}

const inputRef = ref<HTMLInputElement | null>(null)

defineExpose({
    focus: () => inputRef.value?.focus()
})
</script>

<style scoped>
.base-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.base-input-label {
    font-size: var(--font-size-small);
    color: var(--text-secondary);
    font-weight: var(--font-weight-semibold);
}

.base-input {
    width: 100%;
    padding: var(--spacing-sm);
    border-radius: var(--border-radius);
    border: 2px solid var(--border-color);
    font-size: var(--font-size-base);
    transition: border-color 0.2s ease;
    background: var(--card-bg);
}

.base-input:focus {
    border-color: var(--primary-color);
    outline: none;
}
</style>
