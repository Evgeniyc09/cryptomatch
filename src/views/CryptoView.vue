<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from "vue";
import { subscribeToTicker, unsubscribeFromTicker } from "@/api"
import AddTickers from "@/components/AddTickers.vue";
import type { ITicker } from "@/types/ticker.types";
import { useFilteredTickers } from "@/composable/useFilteredTickers";
import { useResizeEvent } from "@/composable/useResizeEvents";

// TODO
// 1. Split the template into components
// 2. Put logic into composable functions
// 3. Autocomplete ticker add instep
// 4. Page navigation of tickers
// 5. Set a limit on adding tickers

const tickers = reactive<ITicker[]>([])
const selectedTicker = ref<ITicker>()

const graph = ref<number[]>([])
const graphEl = ref<HTMLDivElement | null>(null)
const maxGraphElement = ref(1)

const filter = ref<string>('')
const { filteredTickers } = useFilteredTickers(tickers, filter);

const selectTicker = (ticker: ITicker) => {
  selectedTicker.value = ticker
}

// TODO Move to composable function
const localTickets = JSON.parse(localStorage.getItem("cryptomatch") || "[]") as ITicker[]
if (localTickets) {
  localTickets.forEach(ticker => {
    tickers.push(ticker)
    subscribeToTicker(ticker.name, (newPrice: number) =>
      updateTicker(ticker.name, newPrice)
    );
  });
}

const normalizedGraph = computed(() => {
  const maxValue = Math.max(...graph.value);
  const minValue = Math.min(...graph.value);

  if (maxValue === minValue) {
    return graph.value.map(() => 50);
  }

  return graph.value.map(
    price => 5 + ((price - minValue) * 95) / (maxValue - minValue)
  );
})


const handlerAdd = (ticker: ITicker) => {
  const existTicket = tickers.find(t => ticker.name === t.name)

  if (existTicket || ticker.name.length === 0) return

  const currentTicker = { ...ticker };
  tickers.push(currentTicker);

  ticker.name = ''
  ticker.price = '-'

  subscribeToTicker(currentTicker.name, (newPrice: number) =>
    updateTicker(currentTicker.name, newPrice)
  );

}

const updateTicker = (tickerName: string, newPrice: number) => {
  tickers
    .filter(ticker => ticker.name == tickerName)
    .forEach(ticker => {
      if (ticker === selectedTicker.value) {
        graph.value.push(newPrice);
        while (graph.value.length > maxGraphElement.value) {
          graph.value.shift();
        }
      }
      ticker.price = newPrice
    })
}

// TODO Move to composable function
const formatPrice = (price: number | string): string | number => {
  if (price === "-") {
    return price;
  }
  const equalSym = 'Ξ '

  if (typeof price === "number") {
    return price > 1 ? price.toFixed(2) : price.toPrecision(2)
  }
  return equalSym + price;
}

const handlerDelete = (tickerToRemove: ITicker) => {
  const index = tickers.findIndex(t => t.name === tickerToRemove.name);
  if (index !== -1) {
    tickers.splice(index, 1);
    unsubscribeFromTicker(tickerToRemove.name);
  }
}
const calculateMaxGraphElements = () => {
  if (!graphEl.value) {
    return;
  }

  maxGraphElement.value = graphEl.value.clientWidth / 38;
}

watch(tickers, () => {
  localStorage.setItem("cryptomatch", JSON.stringify(tickers))
})

watch(selectedTicker, () => {
  graph.value = []
  nextTick(() => calculateMaxGraphElements())
})

useResizeEvent(calculateMaxGraphElements)
</script>

<template>
  <main class="crypto">
    <div class="container">
      <AddTickers @add-ticker="handlerAdd"></AddTickers>
      <hr class="hr" />

      <!-- TODO: Move to component-->
      <section class="filter-section">
        <div class="filter">
          <div>
            <p>Filter: </p>
            <input v-model="filter" class="input" />
          </div>
        </div>
      </section>

      <!-- TODO: Move to component-->
      <section class="tickers-section">
        <div class="tickers">
          <div v-for="(item, idx) in filteredTickers" :key="idx" @click="selectTicker(item)"
            :class="{ active: selectedTicker === item }" class="tickers__item">
            <p class="tickers__item-title">USD - {{ item.name }}</p>
            <p class="tickers__item-quote">{{ formatPrice(item.price) }}</p>
            <button @click.stop="handlerDelete(item)" class="tickers__item-btn">Delete</button>
          </div>
        </div>
      </section>

      <!-- TODO: Move to component-->
      <section v-if="selectedTicker" class="graph-section">
        <p class="graph__title">{{ selectedTicker.name }}</p>
        <div ref="graphEl" class="graph">
          <div v-for="(percent, idx) in normalizedGraph" :key="idx" :style="{ height: `${percent}%` }"
            class="graph__col">
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
