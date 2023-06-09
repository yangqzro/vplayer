import { cloneDeep, throttle } from "lodash-es";
import { Component } from "../Component";
import { $ } from "../../utils/dom";

import { Render } from "../../decorators";
import { VideoController } from "@/core";
import { PLAYER_EVENT, EVENT } from "@/vars";

import template from "./TimeProgress.art";
import "./TimeProgress.less";
import { watch } from "@/shared/reactive";

interface TimeProgressProps {
    duration: number;
    currentTime: number;
    bufferTime: number;
}

interface TimeProgressState {
    currentTime: number;
}

type TimeProgressEvents = {
    start: () => void;
    seek: (percentage: number) => void;
    seeking: (percentage: number) => void;
    seeked: (percentage: number) => void;
    change: (percentage: number) => void;
    end: () => void;
};

@Render
export class TimeProgress extends Component<TimeProgressProps, TimeProgressState, any, TimeProgressEvents> {
    readonly name: string = "TimeProgress";
    protected readonly selector: string = ".vplayer-timeprogress";
    static readonly defaultProps: TimeProgressProps = {
        duration: 100,
        currentTime: 0,
        bufferTime: 0,
    };
    protected $props: Readonly<TimeProgressProps> = cloneDeep(TimeProgress.defaultProps);
    protected initialState: Readonly<TimeProgressState> = {
        currentTime: TimeProgress.defaultProps.currentTime,
    };

    private _isHover = false;
    get isHover() {
        return this._isHover;
    }

    private _isSeeking = false;
    get isSeeking() {
        return this._isSeeking;
    }

    $setProps(props: TimeProgressProps): void {
        super.$setProps(props);
        this.$state.currentTime = this.$props.currentTime;
    }

    static readonly EVENT = {
        START: "start",
        SEEK: "seek",
        SEEKING: "seeking",
        SEEKED: "seeked",
        CHANGE: "change",
        END: "end",
    } as const;

    private get currentBarWidth() {
        if (this.$props.duration === 0) return 0 + "%";
        return ((this.$state.currentTime / this.$props.duration) * 100).toFixed(2) + "%";
    }

    private get bufferBarWidth() {
        if (this.$props.duration === 0) return 0 + "%";
        return ((this.$props.bufferTime / this.$props.duration) * 100).toFixed(2) + "%";
    }

    $render() {
        return template(this);
    }

    protected $update(): void {
        $(`${this.selector}__current-bar`, this.$el)!.style.width = this.currentBarWidth;
        $(`${this.selector}__buffer-bar`, this.$el)!.style.width = this.bufferBarWidth;
    }

    $init() {
        const self = this;
        function getPercentage(e: MouseEvent) {
            const ele = $(`${self.selector}__bar`, self.$el)!;
            const elX = ele.getBoundingClientRect().left;
            const elWidth = ele.getBoundingClientRect().width;
            let percentage = (e.clientX - elX) / elWidth;
            if (percentage < 0) percentage = 0;
            if (percentage > 1) percentage = 1;
            return +percentage.toFixed(2);
        }

        function updateCurrentTime(percentage: number) {
            self.$state.currentTime = percentage * self.$props.duration;
        }

        const handleMouseMove = throttle((e: Event) => {
            e.preventDefault();
            this._isSeeking = true;
            const percentage = getPercentage(e as MouseEvent);
            updateCurrentTime(percentage);
            this.$emit(TimeProgress.EVENT.SEEKING, percentage);
            this.$emit(TimeProgress.EVENT.CHANGE, percentage);
        }, 200);

        function removeMouseEvent(e: Event) {
            const percentage = getPercentage(e as MouseEvent);
            updateCurrentTime(percentage);
            self.$emit(TimeProgress.EVENT.SEEKED, percentage);
            if (!self._isSeeking) {
                self.$emit(TimeProgress.EVENT.CHANGE, percentage);
            }

            document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
            document.removeEventListener(EVENT.CLICK, removeMouseEvent);
            self._isSeeking = false;
        }

        this.$el?.addEventListener(EVENT.MOUSE_DOWN, e => {
            e.preventDefault();
            const percentage = getPercentage(e as MouseEvent);
            updateCurrentTime(percentage);
            self.$emit(TimeProgress.EVENT.SEEK, percentage);

            document.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
            document.addEventListener(EVENT.CLICK, removeMouseEvent);
        });

        this.$el?.addEventListener(EVENT.MOUSE_ENTER, () => (this._isHover = true));
        this.$el?.addEventListener(EVENT.MOUSE_LEAVE, () => (this._isHover = false));
    }

    protected $attach(vcIns: VideoController, tpIns: TimeProgress) {
        function setTimeProgressProps() {
            if (tpIns.isSeeking) return;
            const props: TimeProgressProps = {
                duration: vcIns.duration,
                currentTime: vcIns.currentTime,
                bufferTime: vcIns.bufferTime,
            };
            tpIns.$setProps(TimeProgress.assgin(props, TimeProgress.defaultProps));
        }
        setTimeProgressProps();

        vcIns.$on(PLAYER_EVENT.TIME_UP_DATE, setTimeProgressProps);
        vcIns.$on(PLAYER_EVENT.PROGRESS, setTimeProgressProps);

        tpIns.$on(TimeProgress.EVENT.SEEKED, percentage => {
            vcIns.currentTime = percentage * this.$props.duration;
        });

        const self = this;
        function listenForStartAndEnd() {
            if (self.$state.currentTime === 0) {
                self.$emit(TimeProgress.EVENT.START);
            }
            if (self.$state.currentTime === self.$props.duration) {
                self.$emit(TimeProgress.EVENT.END);
            }
        }
        watch(this.$state, listenForStartAndEnd, { immediately: true });
    }

    private _isShow = false;
    show() {
        if (this._isShow) return;
        this.$el?.classList.add("show-below");
        this._isShow = true;
        this.$el!.style.cssText = "";
        setTimeout(() => {
            this.$el?.classList.remove("show-below");
        }, 200);
    }

    hide() {
        this.$el?.classList.add("hide-below");
        setTimeout(() => {
            this.$el?.classList.remove("hide-below");
            this.$el!.style.padding = 0 + "px";
            this.$el!.style.bottom = -4 + "px";
            this._isShow = false;
        }, 198);
    }
}
