import { computed, ComputedRef, nextTick, ref, type VNodeRef } from 'vue'
import { showToast } from '../utils/toast'
import { useQuizStore } from '../stores/quiz'

const showReloadConfirm = ref(false)
const showPasswordModal = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const passwordInputRef = ref<VNodeRef | null>(null)
const reloadAfterSave = ref(false)
const listenersRegistered = ref(false)

let guardContext: {
    quizStore: ReturnType<typeof useQuizStore>
    shouldWarnOnReload: ComputedRef<boolean>
} | null = null

export const resetReloadGuardContext = () => {
    guardContext = null
}

const ensureGuardContext = () => {
    if (guardContext) return guardContext

    const quizStore = useQuizStore()
    const shouldWarnOnReload = computed(() => quizStore.answers.length > 0)

    guardContext = { quizStore, shouldWarnOnReload }
    return guardContext
}

const openPasswordModal = () => {
    const { shouldWarnOnReload } = ensureGuardContext()

    if (!shouldWarnOnReload.value) {
        showToast('No unsaved progress to save right now.', 'info')
        return
    }

    showPasswordModal.value = true
    passwordInput.value = ''
    passwordError.value = ''
    nextTick(() => {
        const focusable = passwordInputRef.value as ({ focus?: () => void } | null)
        focusable?.focus?.()
    })
}

const cancelPasswordInput = () => {
    showPasswordModal.value = false
    passwordInput.value = ''
    passwordError.value = ''
    reloadAfterSave.value = false
}

const submitPassword = async () => {
    if (!passwordInput.value) return

    try {
        passwordError.value = ''
        const { quizStore } = ensureGuardContext()
        const success = await quizStore.exportEncryptedData(passwordInput.value)
        if (success) {
            showPasswordModal.value = false
            passwordInput.value = ''
            showToast('Quiz progress saved successfully!', 'success')
            if (reloadAfterSave.value) {
                unregisterReloadGuardListeners()
                reloadAfterSave.value = false
                window.location.reload()
            }
        }
    } catch (error) {
        passwordError.value = error instanceof Error ? error.message : 'Failed to save progress'
    }
}

const saveAndReload = () => {
    reloadAfterSave.value = true
    showReloadConfirm.value = false
    openPasswordModal()
}

const confirmReload = () => {
    unregisterReloadGuardListeners()
    showReloadConfirm.value = false
    window.location.reload()
}

const cancelReload = () => {
    showReloadConfirm.value = false
}

const openReloadConfirm = () => {
    const { shouldWarnOnReload } = ensureGuardContext()
    if (!shouldWarnOnReload.value) return
    showReloadConfirm.value = true
}

export const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
    const { shouldWarnOnReload } = ensureGuardContext()
    if (!shouldWarnOnReload.value) return '';

    showReloadConfirm.value = true
    e.preventDefault()
    e.returnValue = '';
    // leaving e.returnValue untouched avoids the browser's own confirmation dialog
    return '';
}

const keydownHandler = (e: KeyboardEvent) => {
    const { shouldWarnOnReload } = ensureGuardContext()
    if (!shouldWarnOnReload.value) return

    if (e.key === 'F5') {
        e.preventDefault()
        openReloadConfirm()
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault()
        openReloadConfirm()
    }
}

export const registerReloadGuardListeners = () => {
    if (listenersRegistered.value) return
    window.addEventListener('beforeunload', beforeUnloadHandler)
    window.addEventListener('keydown', keydownHandler, { passive: false })
    listenersRegistered.value = true
}

export const unregisterReloadGuardListeners = () => {
    if (!listenersRegistered.value) return
    window.removeEventListener('beforeunload', beforeUnloadHandler)
    window.removeEventListener('keydown', keydownHandler)
    listenersRegistered.value = false
}

export const useReloadGuard = () => {
    const { shouldWarnOnReload } = ensureGuardContext()

    return {
        showReloadConfirm,
        showPasswordModal,
        passwordInput,
        passwordError,
        passwordInputRef,
        openPasswordModal,
        cancelPasswordInput,
        submitPassword,
        cancelReload,
        saveAndReload,
        confirmReload,
        openReloadConfirm,
        shouldWarnOnReload
    }
}
