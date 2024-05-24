import { computed, type Ref } from 'vue'
import type { ITicker } from '@/types/ticker.types'

export function useFilteredTickers(tickers: ITicker[], filter: Ref<string>) {
  const filteredTickers = computed(() => {
    return tickers.filter((ticker) => ticker.name.includes(filter.value))
  })

  return {
    filteredTickers
  }
}
