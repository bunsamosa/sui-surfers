<script setup lang="ts">
import HomeRenderer from "@/components/home/HomeRenderer.vue"
</script>

<template>
    <v-parallax :scale=1 src="assets/background.png" class="h-screen">
        <HomeRenderer />
    </v-parallax>
</template>

<style>
</style>
