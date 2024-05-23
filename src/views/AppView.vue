<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onBeforeMount, nextTick } from "vue";
import { subscribeToTicker, unsubscribeFromTicker } from "@/api"
import type { ITicker } from "@/types/ticker.types";

const ticker = reactive<ITicker>({
  name: "",
  price: "-"
})
const tickers = reactive<ITicker[]>([])
const selectedTicker = ref<ITicker>()

const graph = ref<number[]>([])
const graphEl = ref<HTMLDivElement | null>(null)
const maxGraphElement = ref(1)

const selectTicker = (ticker: ITicker) => {
  selectedTicker.value = ticker
}

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


const handlerAdd = () => {
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
    })
}

const formatPrice = (price: number | string): string | number => {
  if (price === "-") {
    return price;
  }
  if (typeof price === "number") {
    return price > 1 ? price.toFixed(2) : price.toPrecision(2)
  }
  return price;
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
onMounted(() => {
  window.addEventListener("resize", calculateMaxGraphElements)
})
onBeforeMount(() => {
  window.removeEventListener("resize", calculateMaxGraphElements)
})
</script>

<template>
  <div class="appmain">
    <section>
      <h1>Add ticker</h1>
      <input v-model="ticker.name" @keydown.enter="handlerAdd" type="text" />
      <button type="submit" @click.prevent="handlerAdd">
        add new ticker
      </button>
    </section>
    <hr />
    <section>
      <div>Фильтр: <input />
      </div>
    </section>
    <hr />
    <section>
      <button>Prev</button>
      <button>Next</button>
    </section>
    <hr />
    <section class="item-wrapper">
      <div v-for="(item, idx) in tickers" :key="idx" @click="selectTicker(item)">
        <p>{{ item.name }}</p>
        <p>Ξ {{ formatPrice(item.price) }}</p>
        <button @click.stop="handlerDelete(item)">delete</button>
      </div>
    </section>
    <section>
      <div v-if="selectedTicker" ref="graphEl" class="graph">
        <div v-for="(percent, idx) in normalizedGraph" :key="idx" :style="{ height: `${percent}%` }" class="graph-col">
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.item-wrapper {
  display: flex;
  justify-content: space-between;
}

.graph {
  display: flex;
  align-items: end;
  height: 300px;
}

.graph-col {
  width: 30px;
  height: 500px;
  background-color: blueviolet;
  margin-right: 5px;
}
</style>
