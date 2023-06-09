import { VideoController } from "@/core";
import { DanmakuItem } from "@/shared/types";
import { height } from "@/UI/utils/dom";
import { DANMAKU_TYPE, EVENT, PLAYER_EVENT } from "@/vars";
import { cloneDeep, isNil } from "lodash-es";
import { Mount } from "../../decorators";
import { Component } from "../Component";
import { $ } from "../../utils/dom";

import createDanmaku from "./DanmakuScroller.art";
import createDanmakuItem from "./DanmakuItem.art";
import "./DanmakuScroller.less";

interface DanmakuScrollerProps {
    isPause: boolean;
    opacity: number;
    scrollRate: number;
    danmakuList: DanmakuItem[];
}

@Mount
export class DanmakuScroller extends Component<DanmakuScrollerProps> {
    readonly name: string = "DanmakuScroller";
    protected readonly selector: string = ".vplayer-danmaku";
    static readonly defaultProps: DanmakuScrollerProps = {
        opacity: 1.0,
        scrollRate: 1.0,
        isPause: true,
        danmakuList: [],
    };
    protected readonly $props: Readonly<DanmakuScrollerProps> = cloneDeep(DanmakuScroller.defaultProps);

    private get isPause() {
        return this.$props.isPause;
    }

    private get opacity() {
        return this.$props.opacity;
    }

    private readonly _animationTime = 5;
    private duration(modeType: DANMAKU_TYPE) {
        if (modeType === DANMAKU_TYPE.SCROLL) {
            return this._animationTime / this.$props.scrollRate + "s";
        } else {
            return this._animationTime - 1 / this.$props.scrollRate + "s";
        }
    }

    static getModeType(mode: number) {
        if (mode === 0) return DANMAKU_TYPE.SCROLL;
        if (mode === 1) return DANMAKU_TYPE.TOP;
        if (mode === 2) return DANMAKU_TYPE.BOTTOM;
        return DANMAKU_TYPE.SCROLL;
    }

    private readonly _maxFontSize = 24;
    private readonly _itemMaxHeight = this._maxFontSize + 4;
    private get pipeNum() {
        const dmHeight = height(this.$el || this.$container!);
        return Math.floor(dmHeight / this._itemMaxHeight);
    }

    private pipes: { [prop: string]: number[] } = {
        [DANMAKU_TYPE.SCROLL]: [],
        [DANMAKU_TYPE.TOP]: [],
        [DANMAKU_TYPE.BOTTOM]: [],
    };

    private getIdleOrAvailablePipe(type: DANMAKU_TYPE) {
        const pipes = this.pipes[type];
        if (pipes.length === 0) {
            if ([DANMAKU_TYPE.SCROLL, DANMAKU_TYPE.TOP].includes(type)) return 0;
            if (DANMAKU_TYPE.BOTTOM) return this.pipeNum - 1;
        }

        let startPipe = 0;
        let endPipe = 0;
        let reverse = false;
        if (DANMAKU_TYPE.SCROLL === type) {
            startPipe = 0;
            endPipe = this.pipeNum - 1;
            reverse = false;
        }

        if (DANMAKU_TYPE.TOP === type) {
            startPipe = 0;
            endPipe = Math.ceil(this.pipeNum / 2);
            reverse = false;
        }

        if (DANMAKU_TYPE.BOTTOM === type) {
            startPipe = Math.floor(this.pipeNum / 2);
            endPipe = this.pipeNum - 1;
            reverse = true;
        }

        if (!reverse) {
            let pipeHasMinDm = startPipe;
            for (let i = startPipe; i <= endPipe; i++) {
                if (isNil(pipes[i]) || pipes[i] === 0) return i;
                if (pipes[i] >= pipes[pipeHasMinDm]) continue;
                pipeHasMinDm = i;
            }
            return pipeHasMinDm;
        } else {
            let pipeHasMinDm = endPipe;
            for (let i = endPipe; i >= startPipe; i--) {
                if (isNil(pipes[i]) || pipes[i] === 0) return i;
                if (pipes[i] >= pipes[pipeHasMinDm]) continue;
                pipeHasMinDm = i;
            }
            return pipeHasMinDm;
        }
    }

    private addSpecifiedPipeNum(type: DANMAKU_TYPE, index: number) {
        const pipe = this.pipes[type][index];
        if (isNil(pipe)) this.pipes[type][index] = 1;
        else this.pipes[type][index]++;
    }

    private removeSpecifiedPipeNum(type: DANMAKU_TYPE, index: number) {
        const pipe = this.pipes[type][index];
        if (isNil(pipe)) return;
        else this.pipes[type][index]--;
        if (this.pipes[type][index] < 0) this.pipes[type][index] = 0;
    }

    private convertDanmaku(dm: DanmakuItem) {
        const modeType = DanmakuScroller.getModeType(dm.mode);
        const pipe = this.getIdleOrAvailablePipe(modeType);
        this.addSpecifiedPipeNum(modeType, pipe);
        const top = pipe * this._itemMaxHeight + "px";
        const duration = this.duration(modeType);

        return {
            ...dm,
            isPause: this.isPause,
            opacity: this.opacity,
            duration,
            modeType,
            pipe,
            top,
        };
    }

    private readonly _pauseClassName = "vplayer-danmaku__pause";
    private initDanmakuItemEvent(itemEle: HTMLElement) {
        itemEle.addEventListener(EVENT.ANIMATION_END, () => {
            const { modeType, pipe } = itemEle.dataset;
            this.$el!.removeChild(itemEle);
            this.removeSpecifiedPipeNum(modeType as DANMAKU_TYPE, +pipe!);
        });

        itemEle.addEventListener(EVENT.MOUSE_ENTER, () => {
            console.log(EVENT.MOUSE_ENTER);
            itemEle.classList.add(this._pauseClassName);
        });

        itemEle.addEventListener(EVENT.MOUSE_LEAVE, () => {
            console.log(EVENT.MOUSE_LEAVE);
            if (!this.isPause) {
                itemEle.classList.remove(this._pauseClassName);
            }
        });
    }

    $render() {
        const danmakuItems = this.$props.danmakuList.map(dm => createDanmakuItem(this.convertDanmaku(dm))).join("");
        return createDanmaku({ danmakuItems });
    }

    $init() {
        const children = this.$el!.children;
        for (let i = 0, len = children.length; i < len; i++) {
            this.initDanmakuItemEvent(children[i] as HTMLElement);
        }
    }

    pause() {
        const children = this.$el!.children;
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i] as HTMLElement;
            child.classList.add(this._pauseClassName);
        }
    }

    play() {
        const children = this.$el!.children;
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i] as HTMLElement;
            child.classList.remove(this._pauseClassName);
        }
    }

    protected $update() {
        const children = this.$el!.children;
        const idList: string[] = [];
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i] as HTMLElement;
            idList.push(child.dataset.dmId!);
        }

        for (let i = 0, len = this.$props.danmakuList.length; i < len; i++) {
            const dm = this.$props.danmakuList[i];
            if (idList.includes(dm.id)) continue;

            const dmStr = createDanmakuItem(this.convertDanmaku(dm));
            const dmEl = document.createElement("div");
            this.$el?.appendChild(dmEl);
            dmEl.outerHTML = dmStr;
            this.initDanmakuItemEvent($("#vplayer-danmaku__item-" + dm.id, this.$el)!);
        }
    }

    protected $attach(vcIns: VideoController, dsIns: DanmakuScroller) {
        function setDanmakuScrollerProps() {
            const props: DanmakuScrollerProps = {
                opacity: vcIns.danmaku.opacity,
                isPause: vcIns.isPaused,
                scrollRate: vcIns.playbackRate,
                danmakuList: vcIns.danmaku.seek(vcIns.currentTime),
            };

            dsIns.$setProps(DanmakuScroller.assgin(props, DanmakuScroller.defaultProps));
        }
        setDanmakuScrollerProps();

        vcIns.$on(PLAYER_EVENT.PLAY, () => dsIns.play());
        vcIns.$on(PLAYER_EVENT.PAUSE, () => dsIns.pause());
        vcIns.$on(PLAYER_EVENT.TIME_UP_DATE, setDanmakuScrollerProps);
    }
}
