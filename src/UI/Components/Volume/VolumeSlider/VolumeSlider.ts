import { VideoController } from "@/core";
import { EVENT, PLAYBACK_RATE, PLAYER_EVENT } from "@/vars";
import { cloneDeep, functionsIn, isNil, throttle } from "lodash-es";
import { Mount } from "../../../decorators";
import { Component } from "../../Component";

import template from "./VolumeSlider.art";
import "./VolumeSlider.less";
import { VolumeProps } from "../types";
import { $ } from "@/UI/utils/dom";
import { watch } from "@/shared/reactive";

type VolumeSliderProps = VolumeProps;
type VolumeSliderEvents = {
    slided: (volume: number) => void;
    change: (volume: number) => void;
};

@Mount
export class VolumeSlider extends Component<VolumeSliderProps, {}, any, VolumeSliderEvents> {
    readonly name: string = "VolumeSlider";
    protected readonly selector: string = ".vplayer-volume__slider";
    static readonly defaultProps: VolumeSliderProps = {
        volume: 0,
    };
    protected readonly $props: Readonly<VolumeSliderProps> = cloneDeep(VolumeSlider.defaultProps);

    private _isSliding = false;
    get isSliding() {
        return this._isSliding;
    }

    static readonly EVENT = {
        CHANGE: "change",
        SLIDED: "slided",
    } as const;

    private get volume() {
        return this.$props.volume;
    }

    $render() {
        return template(this);
    }

    protected $update() {
        $("span", this.$el)!.innerHTML = this.volume + "";
        $(".vplayer-volume__current-bar", this.$el)!.style.top = 54 - (this.volume / 100) * 54 + "px";
        $(".vplayer-volume__slider-dot", this.$el)!.style.top = 48 - (this.volume / 100) * 54 + "px";
    }

    $init() {
        const self = this;
        function getVolume(e: MouseEvent) {
            const bottom = $(".vplayer-volume__slider-bar", self.$el)?.getBoundingClientRect().bottom || 0;
            const mouseY = (e as MouseEvent).clientY;
            let diff = bottom - 6 - mouseY;
            if (diff > 54) diff = 54;
            if (diff < 0) diff = 0;

            let percentage = Math.round((diff / 54) * 100);
            return +percentage;
        }

        let timer: number | null = null;
        function handleMouseMoveOutside(e: Event) {
            timer = setTimeout(() => {
                self.$emit(VolumeSlider.EVENT.CHANGE, 0);
                self.$emit(VolumeSlider.EVENT.SLIDED, 0);

                removeMouseEvent();
                self._isSliding = false;
                self.hide();
            }, 500);
        }

        function handleMouseEnter() {
            if (!isNil(timer)) clearTimeout(timer);
        }

        const handleMouseMove = throttle((e: Event) => {
            e.preventDefault();
            this._isSliding = true;
            this.$emit(VolumeSlider.EVENT.CHANGE, getVolume(e as MouseEvent));
        }, 100);

        function removeMouseEvent() {
            self.$el?.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
            self.$el?.removeEventListener(EVENT.MOUSE_ENTER, handleMouseEnter);
            self.$el?.removeEventListener(EVENT.MOUSE_LEAVE, handleMouseMoveOutside);
        }

        this.$el?.addEventListener(EVENT.MOUSE_DOWN, e => {
            e.preventDefault();

            this.$el?.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
            this.$el?.addEventListener(EVENT.MOUSE_ENTER, handleMouseEnter);
            this.$el?.addEventListener(EVENT.MOUSE_LEAVE, handleMouseMoveOutside);
        });

        this.$el?.addEventListener(EVENT.CLICK, e => {
            // 防止触发父类的静音事件
            e.stopPropagation();

            const volume = getVolume(e as MouseEvent);
            this.$emit(VolumeSlider.EVENT.SLIDED, volume);

            if (!this._isSliding) {
                this.$emit(VolumeSlider.EVENT.CHANGE, volume);
            }

            removeMouseEvent();
            this._isSliding = false;
        });
    }

    protected $attach(vcIns: VideoController, vsIns: VolumeSlider) {
        function setVolumeSliderProps() {
            vsIns.$setProps(VolumeSlider.assgin({ volume: vcIns.volume }, VolumeSlider.defaultProps));
        }

        setVolumeSliderProps();
        vcIns.$on(PLAYER_EVENT.VOLUME_CHANGE, setVolumeSliderProps);

        vsIns.$on(VolumeSlider.EVENT.CHANGE, volume => {
            vcIns.volume = volume;
        });
    }
}
