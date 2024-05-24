<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
<template>
    <header class="header">
        <div class="container">
            <nav class="header__nav">
                <RouterLink to="/" class="header__link">Home</RouterLink>
                <RouterLink to="/crypto" class="header__link">Go to app</RouterLink>
            </nav>
        </div>
    </header>
</template>