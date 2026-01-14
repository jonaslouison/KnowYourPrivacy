<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
    const selected = props.options.find(opt => opt.value === props.modelValue)
    return selected ? selected.label : props.placeholder || 'Select...'
})

const toggleDropdown = () => {
    if (!props.disabled) {
        isOpen.value = !isOpen.value
    }
}

const selectOption = (option: DropdownOption) => {
    emit('update:modelValue', option.value)
    isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div 
        ref="dropdownRef"
        class="dropdown-wrapper"
        :class="{ disabled: props.disabled }"
    >
        <button
            type="button"
            :id="props.id"
            class="dropdown-trigger"
            :class="{ open: isOpen }"
            :disabled="props.disabled"
            @click="toggleDropdown"
        >
            <span class="dropdown-text">{{ selectedLabel }}</span>
            <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
        </button>
        
        <!-- Mobile backdrop -->
        <div v-if="isOpen" class="dropdown-backdrop" @click="isOpen = false"></div>
        
        <div v-if="isOpen" class="dropdown-menu">
            <button
                v-for="option in props.options"
                :key="option.value"
                type="button"
                class="dropdown-option"
                :class="{ selected: option.value === props.modelValue }"
                @click="selectOption(option)"
            >
                {{ option.label }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.dropdown-wrapper {
    position: relative;
    width: 100%;
}

.dropdown-wrapper.disabled {
    opacity: 0.6;
    pointer-events: none;
}

.dropdown-trigger {
    width: 100%;
    border-radius: 999px;
    border: 2px solid var(--secondary-color);
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    background: var(--card-bg);
    color: var(--text-primary);
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    font-size: 0.95rem;
    transition: border-color 0.2s ease;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.dropdown-trigger:hover {
    border-color: var(--primary-color);
}

.dropdown-trigger.open {
    border-color: var(--primary-color);
}

.dropdown-trigger:disabled {
    cursor: not-allowed;
}

.dropdown-text {
    flex: 1;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    line-height: 1.3;
}

.dropdown-arrow {
    flex-shrink: 0;
    color: var(--text-secondary);
    font-size: 0.75rem;
    transition: transform 0.2s ease;
}

.dropdown-arrow.open {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    overflow-y: auto;
}

.dropdown-option {
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    text-align: left;
    font-family: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.15s ease;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.dropdown-option:hover {
    background: var(--hover-bg, rgba(0, 0, 0, 0.05));
}

.dropdown-option.selected {
    background: var(--primary-color);
    color: white;
    font-weight: 600;
}

.dropdown-option:first-child {
    border-radius: 10px 10px 0 0;
}

.dropdown-option:last-child {
    border-radius: 0 0 10px 10px;
}

.dropdown-option:only-child {
    border-radius: 10px;
}

@media (max-width: 768px) {
    .dropdown-trigger {
        font-size: 0.85rem;
        padding: 0.6rem 2rem 0.6rem 0.75rem;
        min-height: 44px;
        border-radius: 10px;
    }

    .dropdown-text {
        font-size: 0.85rem;
        line-height: 1.25;
    }
    
    .dropdown-arrow {
        font-size: 0.65rem;
    }

    .dropdown-menu {
        position: fixed;
        top: 50%;
        left: 50%;
        right: auto;
        bottom: auto;
        transform: translate(-50%, -50%);
        width: calc(100vw - 2rem);
        max-width: 400px;
        margin-top: 0;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }

    .dropdown-option {
        padding: 1rem;
        font-size: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .dropdown-option:last-child {
        border-bottom: none;
    }
}

/* Mobile overlay backdrop */
.dropdown-backdrop {
    display: none;
}

@media (max-width: 768px) {
    .dropdown-backdrop {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 9998;
    }
}
</style>
