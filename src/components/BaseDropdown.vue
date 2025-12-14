<script setup lang="ts">
import type { PropType } from 'vue'

type DropdownOption = {
    value: string | number
    label: string
}

const props = defineProps({
    id: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    modelValue: {
        type: [String, Number] as PropType<string | number>,
        default: ''
    },
    options: {
        type: Array as PropType<DropdownOption[]>,
        default: () => []
    },
    placeholder: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits<{
    (event: 'update:modelValue', value: string | number): void
    (event: 'change', payload: Event): void
}>()

const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    emit('update:modelValue', target.value)
    emit('change', event)
}
</script>

<template>
    <select
        :id="props.id"
        :name="props.name"
        :value="props.modelValue"
        :disabled="props.disabled"
        @change="handleChange"
        class="base-dropdown"
    >
        <option v-if="props.placeholder" value="">{{ props.placeholder }}</option>
        <option
            v-for="option in props.options"
            :key="option.value"
            :value="option.value"
        >
            {{ option.label }}
        </option>
    </select>
</template>

<style scoped>
.base-dropdown {
    width: 100%;
    border-radius: 999px;
    border: 2px solid var(--secondary-color);
    padding: 0.5rem 1rem;
    background: var(--card-bg);
    color: var(--text-primary);
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    background-origin: border-box;
    background-clip: padding-box, border-box;
}

.base-dropdown:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
