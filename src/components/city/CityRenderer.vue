<script setup lang="ts">
import { Game } from "./game";

// fetch container ID from props
const props = defineProps<{
    container: string
}>();
const container: HTMLElement = document.getElementById(props.container) as HTMLElement;

// create the game
const game = new Game(container);
</script>

<template>
    <v-row justify="space-around">
        <v-col cols="auto">
            <!-- <router-link to="/stream" target="_blank">
                <v-btn color="primary">Host Event</v-btn>
            </router-link> -->
            <a href="https://www.google.com" target="_blank">
                <v-btn color="primary"> Go back to wallet: {{ $route.query.id }}</v-btn>
            </a>
        </v-col>
        <v-col cols="auto">
            <!-- <router-link to="/validate" target="_blank">
                <v-btn color="primary">Theatre</v-btn>
            </router-link> -->
        </v-col>
    </v-row>
</template>
