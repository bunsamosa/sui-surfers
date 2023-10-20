<script>
import videojs from 'video.js';

// video player with videojs
export default {
    name: 'VideoPlayer',
    props: {
        options: {
            type: Object,
            default() {
                return {
                    autoplay: false,
                    controls: true,
                    sources: [
                        {
                            src: import.meta.env.VITE_LIVEPEER_STREAM,
                            type: 'application/x-mpegURL'
                        }
                    ]
                };
            }
        }
    },
    data() {
        return {
            player: null
        }
    },
    mounted() {
        this.player = videojs(this.$refs.videoPlayer, this.options, () => {
            this.player.log('onPlayerReady', this);
        });
    },
    beforeDestroy() {
        if (this.player) {
            this.player.dispose();
        }
    }
}
</script>

<template>
    <video ref="videoPlayer" class="video-js"></video>
</template>
