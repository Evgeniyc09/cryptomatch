<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/app">go to app</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>