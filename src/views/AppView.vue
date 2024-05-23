<script setup>
import { reactive, ref, watch } from "vue";
import { subscribeToTicker, unsubscribeFromTicker } from "@/api"

const ticker = reactive({
  name: "",
  price: "-"
})
const tickers = reactive([])


const handlerAdd = () => {
  const currentTicker = { ...ticker };
  tickers.push(currentTicker);

  ticker.name = ''
  ticker.price = '-'

  subscribeToTicker(currentTicker.name, newPrice =>
    updateTicker(currentTicker.name, newPrice)
  );

}

function updateTicker(tickerName, newPrice) {
  tickers
    .filter(ticker => ticker.name == tickerName)
    .forEach(ticker => {
      if (ticker.name === tickerName) {
        ticker.price = newPrice;
      }
    })
}

const formatPrice = (price) => {
  if (price === "-") {
    return price;
  }
  return price > 1 ? price.toFixed(2) : price.toPrecision(2);

}

const handlerDelete = (tickerToRemove) => {
  console.log(tickers);
  const index = tickers.findIndex(t => t.name === tickerToRemove.name);
  if (index !== -1) {
    tickers.splice(index, 1);
    console.log(`Deleted ticker: ${tickerToRemove.name}`);
    unsubscribeFromTicker(tickerToRemove.name);
  }
  // if (this.selectedTicker === tickerToRemove) {
  //   this.selectedTicker = null;
  // }
  unsubscribeFromTicker(tickerToRemove.name);
}

// watch(tickers, (newValue, oldValue) => {
//   console.log
//   console.log(newValue.name, oldValue.name);
//   // localStorage.setItem("cryptomatch", JSON.stringify(this.tickers));

// })

</script>

<template>
  <div class="appmain">
    <section>
      <h1>Add ticker</h1>
      <form action="">
        <input v-model="ticker.name" @keydown.enter="handlerAdd" type="text">
        <button type="submit" @click.prevent="handlerAdd">add new ticker</button>
      </form>
    </section>

    <hr>

    <section>
      <div>Фильтр: <input /></div>
    </section>

    <hr>

    <section>
      <button>Prev</button>
      <button>Next</button>
    </section>

    <hr>

    <section>
      <div v-for="item in tickers" :key="item">
        <p>{{ item.name }}</p>
        <p>Ξ {{ formatPrice(item.price) }}</p>
        <button @click="handlerDelete(item)">delete</button>
      </div>
    </section>
  </div>
</template>

<style></style>
