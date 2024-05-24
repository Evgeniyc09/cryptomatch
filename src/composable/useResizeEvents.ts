import { onMounted, onBeforeUnmount } from 'vue'

export function useResizeEvent(callback: () => void) {
  onMounted(() => {
    window.addEventListener('resize', callback)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', callback)
  })
}
