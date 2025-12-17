import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TimerState {
  startTime: number | null
  endTime: number | null
  isRunning: boolean
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
}

export const useTimerStore = defineStore('timer', () => {
  // Quiz timer (Start Quiz → End Card)
  const quizTimer = ref<TimerState>({
    startTime: null,
    endTime: null,
    isRunning: false
  })

  // Load data timer (Load Saved Data → Dashboard loaded)
  const loadTimer = ref<TimerState>({
    startTime: null,
    endTime: null,
    isRunning: false
  })

  // Current time for live updates
  const currentTime = ref(Date.now())
  let intervalId: ReturnType<typeof setInterval> | null = null

  const startInterval = () => {
    if (intervalId) return
    intervalId = setInterval(() => {
      currentTime.value = Date.now()
    }, 10) // Update every 10ms for smooth display
  }

  const stopInterval = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Quiz timer methods
  const startQuizTimer = () => {
    quizTimer.value = {
      startTime: Date.now(),
      endTime: null,
      isRunning: true
    }
    startInterval()
  }

  const stopQuizTimer = () => {
    if (quizTimer.value.isRunning) {
      quizTimer.value.endTime = Date.now()
      quizTimer.value.isRunning = false
      // Stop interval if load timer is also not running
      if (!loadTimer.value.isRunning) {
        stopInterval()
      }
    }
  }

  const resetQuizTimer = () => {
    quizTimer.value = {
      startTime: null,
      endTime: null,
      isRunning: false
    }
  }

  // Load timer methods
  const startLoadTimer = () => {
    loadTimer.value = {
      startTime: Date.now(),
      endTime: null,
      isRunning: true
    }
    startInterval()
  }

  const stopLoadTimer = () => {
    if (loadTimer.value.isRunning) {
      loadTimer.value.endTime = Date.now()
      loadTimer.value.isRunning = false
      // Stop interval if quiz timer is also not running
      if (!quizTimer.value.isRunning) {
        stopInterval()
      }
    }
  }

  const resetLoadTimer = () => {
    loadTimer.value = {
      startTime: null,
      endTime: null,
      isRunning: false
    }
  }

  // Computed elapsed times
  const quizElapsedMs = computed(() => {
    if (!quizTimer.value.startTime) return 0
    const end = quizTimer.value.endTime ?? currentTime.value
    return end - quizTimer.value.startTime
  })

  const loadElapsedMs = computed(() => {
    if (!loadTimer.value.startTime) return 0
    const end = loadTimer.value.endTime ?? currentTime.value
    return end - loadTimer.value.startTime
  })

  const quizElapsedFormatted = computed(() => formatTime(quizElapsedMs.value))
  const loadElapsedFormatted = computed(() => formatTime(loadElapsedMs.value))

  const quizTimerActive = computed(() => quizTimer.value.startTime !== null)
  const loadTimerActive = computed(() => loadTimer.value.startTime !== null)

  const quizTimerRunning = computed(() => quizTimer.value.isRunning)
  const loadTimerRunning = computed(() => loadTimer.value.isRunning)

  const quizTimerCompleted = computed(() => quizTimer.value.endTime !== null)
  const loadTimerCompleted = computed(() => loadTimer.value.endTime !== null)

  // Copy to clipboard
  const copyQuizTime = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(quizElapsedFormatted.value)
      return true
    } catch {
      return false
    }
  }

  const copyLoadTime = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(loadElapsedFormatted.value)
      return true
    } catch {
      return false
    }
  }

  return {
    // State
    quizTimer,
    loadTimer,
    
    // Quiz timer
    startQuizTimer,
    stopQuizTimer,
    resetQuizTimer,
    quizElapsedMs,
    quizElapsedFormatted,
    quizTimerActive,
    quizTimerRunning,
    quizTimerCompleted,
    copyQuizTime,
    
    // Load timer
    startLoadTimer,
    stopLoadTimer,
    resetLoadTimer,
    loadElapsedMs,
    loadElapsedFormatted,
    loadTimerActive,
    loadTimerRunning,
    loadTimerCompleted,
    copyLoadTime
  }
})
