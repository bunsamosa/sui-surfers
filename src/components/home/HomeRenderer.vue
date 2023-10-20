<script setup lang="ts">
import { ref } from "vue";
import startButton from "./startButton.json";

var taglines = ref([
    "Explore your city",
    "Attend events",
    "Play games",
])
</script>

<template>
    <div class="centerDiv">
        <v-container :fluid=true tag="logo">
            <v-img src="assets/rubix_logo_white.png" width="40vh" class="mx-auto"></v-img>
        </v-container>
        <v-container :fluid=true>
            <p class="question mx-auto">Feeling bored at home?</p>
        </v-container>
        <v-container>
            <vue-writer :array=taglines class="taglines" :typeSpeed=75 :eraseSpeed=25 />
            <!-- <v-carousel class="taglines" :show-arrows="false" :hide-delimiters="true" :cycle="true" :interval="2000">
                <v-carousel-item>
                    Explore your city
                </v-carousel-item>
                <v-carousel-item>
                    Attend events
                </v-carousel-item>
                <v-carousel-item>
                    Play games
                </v-carousel-item>

            </v-carousel> -->
        </v-container>
        <v-container>
            <router-link to="/city">
                <Vue3Lottie :animationData="startButton" height="25vh" class="start-btn"></Vue3Lottie>
            </router-link>
        </v-container>
    </div>
</template>

<style>
.question {
    color: #FFC700;
    font-family: Inter;
    font-size: 4vh;
    font-weight: 700;
    line-height: 4vw;
    letter-spacing: 0em;
    text-align: center;
}

.taglines {
    color: #ffffff;
    font-family: Inter;
    font-size: 3vh;
    font-weight: 500;
    line-height: 4vw;
    text-align: center;
}

.start-btn {
    margin-top: -10vh !important;
}

.centerDiv {
    padding-top: 15vh;
}


/* Desktops */
@media screen and (min-height : 720px) and (min-width: 1280px) and (-webkit-min-device-pixel-ratio: 1) {
    .question {
        color: #FFC700;
        font-family: Inter;
        font-size: 5.5vh;
        font-weight: 700;
        line-height: 4vw;
        letter-spacing: 0em;
        text-align: center;
    }

    .taglines {
        color: #ffffff;
        font-family: Inter;
        font-size: 3.5vh;
        font-weight: 500;
        line-height: 4vw;
        text-align: center;
    }
}
</style>
