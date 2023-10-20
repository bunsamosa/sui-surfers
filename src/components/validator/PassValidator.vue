<script setup lang="ts">
import { ref, watch } from "vue";
import VideoStream from "@/views/VideoPlayer.vue";

let validation = ref(false);

// on qr read - call ethpass api
async function onDecode(decodedString) {
    console.log(decodedString);

    // call ethpass api with qr data
    fetch(`https://api.ethpass.xyz/api/v0/passes/barcode?data=${decodedString}`, {
        method: "GET",
        headers: {
            "X-API-KEY": import.meta.env.VITE_ETHPASS_API_KEY
        }
    })
        .then((response) => response.json())
        .then((result) => {
            validated(result);
        })
        .catch((error) => {
            invalid(error);
        });
};

// valid ticket
function validated(data) {
    validation.value = true;
    console.log(data);
    // validate contract address
    if (data["contractAddress"] != import.meta.env.VITE_POLYGON_CONTRACT_ADDRESS) {
        invalid(data);
        return
    }
    alert("Validated ticket ID: " + data["tokenId"]);
};

// invlaid ticket
function invalid(error) {
    validation.value = false;
    console.log(error);
    alert("Unable to verify your ticket");
};

</script>

<template>
    <div class="steamer">
        <v-container>
            <h2>Surfer Threatre</h2>
        </v-container>
        <v-container v-if="!validation">
            <qrcode-stream @decode="onDecode"></qrcode-stream>
        </v-container>
        <v-container v-if="validation">
            <VideoStream />
        </v-container>
    </div>
</template>

<style>
.steamer {
    text-align: center;
    background-color: #161618;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: rgb(237, 237, 239);
}

.streamButtons {
    width: 10%;
}

.streamVideo {
    height: 300px;
    width: 400px;
    border: 1px solid rgb(158, 140, 252);
    margin: 30px;
    background-color: black;
    border-radius: 3px;
}
</style>
