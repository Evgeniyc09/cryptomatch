<script setup lang="ts">
import type { ITicker } from '@/types/ticker.types';
import { reactive } from 'vue';

const emit = defineEmits(['add-ticker']);

const ticker = reactive<ITicker>({
    name: "",
    price: "-"
})

const handlerAdd = () => {
    emit('add-ticker', ticker);
    ticker.name = '';
    ticker.price = '-';
}
</script>

<template>
    <section class="add-section">
        <h1>Add ticker</h1>
        <input v-model="ticker.name" @keydown.enter="handlerAdd" type="text" class="input" />
        <button type="submit" @click.prevent="handlerAdd" class="btn">
            Add new ticker
        </button>
    </section>
</template>