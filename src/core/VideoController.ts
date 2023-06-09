import { Events } from "@/events";
import { error, warn } from "@/shared/error";
import { Player } from "@/UI";
import { PLAYER_EVENT, FULL_SCREEN_TYPE, VIDEO_EVENT, PLAYBACK_RATE } from "@/vars";
import { isNil } from "lodash-es";
import { Danmaku } from "./Danmaku";
import { parse } from "./parser";

export class VideoController extends Events {
    danmaku: Danmaku = new Danmaku();
    constructor(src: string) {
        super();
        this.src = src;
        // this.danmaku = new Danmaku()

        // this.$on(PLAYER_EVENT.LOAD_START, () => {
        //     !isNil(this._video) && (this._video.currentTime = 0.04);
        // });
    }

    protected src: string;
    private _video: HTMLVideoElement | null = null;
    get $video() {
        if (!isNil(this._video)) return this._video;
        error(
            "No video element. You can add a video element using 'attach' method, or use 'search' method to find it automatically."
        );
        return null;
    }
    attach(video: HTMLVideoElement) {
        if (!isNil(this._video) && this._video === video) return;
        this._video = video;

        this._video.src = this.src;
        // set it false: chrome is muted by default.
        this._video.muted = false;
        this._video.currentTime = 0.04;

        (Object.values(VIDEO_EVENT) as string[]).forEach(event => {
            this._video!.addEventListener(event, () => {
                this.$emit(event);
            });
        });

        parse(this._video);
    }
    search() {
        const video = document.querySelector("video");
        if (!isNil(video)) return this.attach(video);
        warn("Can't find video element.");
    }

    private _player: Player | null = null;
    get player() {
        if (!isNil(this._player)) return this._player;
        error("No player. Please use 'control' method to set it.");
        return null;
    }
    control(player: Player) {
        if (!isNil(this._player) && this._player === player) return;
        if (!player.isMounted) {
            return error("Player isn't mounted.");
        }
        this._player = player;

        this.attach(this._player.$video!);
        this._player.$provide(this);
    }

    get canPlay() {
        return !isNil(this.$video) && this.$video.readyState >= 3;
    }
    get isPaused() {
        if (isNil(this.$video)) return true;
        return this.$video.paused;
    }
    play() {
        if (!this.canPlay) {
            return warn("Video can't be played while loading.");
        }
        this.$video?.play();
    }
    pause() {
        this.$video?.pause();
    }

    get volume() {
        if (isNil(this.$video) || this.$video.muted) {
            return 0;
        } else {
            return Math.floor(this.$video.volume * 100);
        }
    }
    set volume(volume: number) {
        if (volume < 0 || volume > 100) {
            warn(`Volume should be between 1 and 100.`);
        }

        if (volume > 100) volume = 100;
        else if (volume < 0) volume = 0;

        if (!isNil(this.$video)) this.$video.volume = volume / 100;
    }
    get isMuted() {
        return this.volume === 0;
    }

    private _fullScreenType: "web" | "browser" | "none" = FULL_SCREEN_TYPE.NONE;
    exitFullScreen() {
        if (this._fullScreenType === FULL_SCREEN_TYPE.NONE) return;
        this.player?.exitFullScreen();
        this._fullScreenType = FULL_SCREEN_TYPE.NONE;
        this.$emit(PLAYER_EVENT.FULL_SCREEN_OFF);
    }
    fullScreen() {
        if (this._fullScreenType === FULL_SCREEN_TYPE.BROWSER) return;
        this.player?.fullScreen();
        this._fullScreenType = FULL_SCREEN_TYPE.BROWSER;
        this.$emit(PLAYER_EVENT.FULL_SCREEN);
    }
    get isFullScreen() {
        return this._fullScreenType === FULL_SCREEN_TYPE.BROWSER;
    }
    webFullScreen() {
        if (this._fullScreenType === FULL_SCREEN_TYPE.WEB) return;
        this.player?.webFullScreen();
        this._fullScreenType = FULL_SCREEN_TYPE.WEB;
        this.$emit(PLAYER_EVENT.WEB_FULL_SCREEN);
    }
    get isWebFullScreen() {
        return this._fullScreenType === FULL_SCREEN_TYPE.WEB;
    }

    get duration() {
        return this.$video?.duration || 0;
    }
    get currentTime() {
        return this.$video?.currentTime || 0;
    }
    set currentTime(time: number) {
        if (time < 0 || time > this.duration) {
            warn(`Time should be between 1 and ${this.duration}.`);
        }

        if (time > this.duration) time = this.duration;
        else if (time < 0) time = 0;
        if (!isNil(this.$video)) this.$video.currentTime = time;
    }
    get bufferTime() {
        if (isNil(this.$video)) return 0;
        const buffer = this.$video.buffered;
        let result = 0;
        for (let i = 0, len = buffer.length; i < len; i++) {
            result += buffer.end(i) - buffer.start(i);
        }
        return result;
    }

    get playbackRate() {
        return this.$video?.playbackRate || PLAYBACK_RATE.NORMAL;
    }
    set playbackRate(rate: number) {
        if (rate < 0.5 || rate > 4.0) {
            warn(`Time should be between 0.5 and 4.0.`);
        }

        if (rate > 4.0) rate = 4.0;
        else if (rate < 0.5) rate = 0.5;

        if (!isNil(this.$video)) this.$video.playbackRate = rate;
        this.danmaku.scrollRate = rate;
    }

    get inPip() {
        if (isNil(this.$video) || isNil(document.pictureInPictureElement)) return false;
        return document.pictureInPictureElement === this.$video;
    }
    pip() {
        if (isNil(this.$video)) return;
        if (!this.canPlay) return error("Loading, video el can't request picture in picture.");
        this.$video.requestPictureInPicture();
    }
    exitPip() {
        if (!this.inPip) return;
        document.exitPictureInPicture();
    }
}
