<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Client } from "@livepeer/webrtmp-sdk";

// livepeer api key and video elements
const apiKey: any = import.meta.env.VITE_LIVEPEER_KEY;
const streamVideo: any = ref("streamVideo");
const stream: any = ref(null);
let session: any;

onMounted(async () => {
    // set volume to 0
    streamVideo.value.volume = 0;

    // fetch video stream from PC
    stream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });

    // attach video source to stream video element and play
    streamVideo.value.srcObject = stream.value;
});

// start streaming
function startStream() {
    if (!stream.value) {
        alert("Video stream has not started yet");
    }

    // create stream session
    const client = new Client()
    streamVideo.value.play();

    // stream session and callback setups
    console.log(apiKey);
    session = client.cast(stream.value, apiKey);

    session.on("open", () => {
        console.log("Stream started.")
        alert("Stream started");
    })

    session.on("close", () => {
        alert("Stream stopped.");
    })

    session.on("error", (err) => {
        console.log("Stream error.", err.message);
    })
};

// stop stream
function stopStream() {
    if (session === undefined) {
        alert("Not streaming right now");
        return;
    }
    session.close();
}
</script>

<template>
    <div class="steamer">
        <v-container>
            <h2>sui surfer Livestream</h2>
        </v-container>
        <v-container>
            <video class="streamVideo" ref="streamVideo" />
        </v-container>
        <v-container class="streamButtons">
            <v-row justify="center">
                <v-btn @click="startStream">Start</v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="stopStream">Stop</v-btn>
            </v-row>
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
