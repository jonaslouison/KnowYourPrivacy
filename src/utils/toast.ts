// Toast notification system
export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    count: number
}

class ToastManager {
    private toasts: Toast[] = []
    private listeners: Set<(toasts: Toast[]) => void> = new Set()
    private toastKeys = new Map<string, string>()
    private toastTimers = new Map<string, ReturnType<typeof setTimeout>>()
    private toastIdToKey = new Map<string, string>()

    show(message: string, type: Toast['type'] = 'info', duration: number = 3000): void {
        const key = `${type}|${message}`
        const existingId = this.toastKeys.get(key)

        if (existingId) {
            const existing = this.toasts.find((toast) => toast.id === existingId)
            if (existing) {
                existing.count += 1
                this.notify()
                this.resetTimer(existing.id, duration)
                return
            }
        }

        const id = Math.random().toString(36).substr(2, 9)
        const toast: Toast = { id, message, type, count: 1 }
        this.toastKeys.set(key, id)
        this.toastIdToKey.set(id, key)

        this.toasts.push(toast)
        this.notify()

        if (duration > 0) {
            this.resetTimer(id, duration)
        }
    }

    private resetTimer(id: string, duration: number) {
        this.clearTimer(id)
        if (duration <= 0) return
        const timer = setTimeout(() => {
            this.remove(id)
        }, duration)
        this.toastTimers.set(id, timer)
    }

    private clearTimer(id: string) {
        const timer = this.toastTimers.get(id)
        if (timer) {
            clearTimeout(timer)
            this.toastTimers.delete(id)
        }
    }

    remove(id: string): void {
        this.clearTimer(id)
        this.toasts = this.toasts.filter((t) => t.id !== id)
        const key = this.toastIdToKey.get(id)
        if (key) {
            this.toastKeys.delete(key)
            this.toastIdToKey.delete(id)
        }
        this.notify()
    }

    subscribe(callback: (toasts: Toast[]) => void): () => void {
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }

    private notify(): void {
        this.listeners.forEach(callback => callback([...this.toasts]))
    }

    getToasts(): Toast[] {
        return [...this.toasts]
    }
}

export const toastManager = new ToastManager()

export function showToast(message: string, type: Toast['type'] = 'info', duration?: number): void {
    toastManager.show(message, type, duration)
}
