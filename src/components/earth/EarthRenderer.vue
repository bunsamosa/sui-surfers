<script setup lang="ts">
import * as THREE from "three";
import { ref, onMounted } from "vue";
import { APP } from "./app.js";
import json from "./app.json";

// define ref for division
const mycanvas = ref<HTMLInputElement | null>(null);

// Used by APP Scripts.
window.THREE = THREE;

// load json into player
const player = new (APP.Player as any)();
player.load(json);
player.setSize(window.innerWidth, window.innerHeight);
player.play();

// resize the scene
function resizeScene() {
    player.setSize(window.innerWidth, window.innerHeight);
}

// attach renderer to dom
onMounted(() => {
    if (mycanvas.value) {
        mycanvas.value.appendChild(player.dom);
        window.addEventListener("resize", resizeScene);
    }
});
</script>

<template>
    <div ref="mycanvas"></div>
</template>
