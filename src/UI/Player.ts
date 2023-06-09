import { ToolBar } from "./Components/ToolBar";
import { Component } from "./Components/Component/Component";
import { PlayButton } from "./Components/PlayButton";
import { Volume } from "./Components/Volume";
import { FullScreen } from "./Components/FullScreen";
import { WebFullScreen } from "./Components/WebFullScreen";
import { Container } from "./Components/Container";
import { TimeProgress } from "./Components/TimeProgress";
import { PlaybackRate } from "./Components/PlaybackRate";
import { PictureInPicture } from "./Components/PictureInPicture";

import { provide } from "@/shared/transfer";
import { VideoController } from "@/core";

import template from "./Player.art";
import "./Player.less";
// import "normalize.css";
import { $ } from "./utils/dom";
import { Before, Attacher } from "./decorators";
import { TimeRange } from "./Components/TimeRange";
import { EVENT } from "@/vars";
import { isInteger, isNil, throttle } from "lodash-es";

type PlayerEvents = {
    click: (e: Event) => void;
    mousemove: (e: Event) => void;
    mouseenter: (e: Event) => void;
    mouseleave: (e: Event) => void;
};

export class Player extends Component<{}, {}, any, PlayerEvents> {
    readonly name: string = "Player";
    protected readonly selector: string = ".vplayer";

    static readonly EVENT = {
        CLICK: "click",
        MOUSE_MOVE: "mousemove",
        MOUSE_ENTER: "mouseenter",
        MOUSE_LEAVE: "mouseleave",
    } as const;

    get $video() {
        return ($(".vplayer-container__video", this.$el!) || $("video", this.$el!)) as HTMLVideoElement | null;
    }

    readonly toolbar: ToolBar;
    readonly vContainer: Container;
    readonly timeProgress: TimeProgress;

    constructor() {
        super();
        this.toolbar = new ToolBar(
            new PlayButton(),
            new TimeRange(),
            new Volume(),
            new FullScreen(),
            new WebFullScreen(),
            new PlaybackRate(),
            new PictureInPicture()
        );
        this.vContainer = new Container();
        this.timeProgress = new TimeProgress();
    }

    private get toolbarHTML() {
        return this.toolbar.$render();
    }

    private get containerHTML() {
        return this.vContainer.$render();
    }

    private get timeProgressHTML() {
        return this.timeProgress.$render();
    }

    $render() {
        return template(this);
    }

    @Before("$attach")
    $init() {
        this.vContainer.$init();
        this.timeProgress.$init();
        this.toolbar.$init();

        this.$el?.addEventListener(EVENT.CONTEXT_MENU, e => {
            e.preventDefault();
        });

        Object.values(Player.EVENT).forEach(evt => {
            this.$el?.addEventListener(evt, e => {
                this.$emit(evt as keyof PlayerEvents, e);
            });
        });
    }

    @Attacher
    protected $attach(vcIns: VideoController, pIns: Player): void {
        // listen for other ways to exit full screen
        this.$el?.addEventListener(EVENT.FULL_SCREEN_CHANGE, () => {
            // exit full screen
            if (!document.fullscreenElement) {
                vcIns.exitFullScreen();
            }
        });

        let timer: number | null = null;
        let isOutside = false;
        const handleContainerMouseMove = throttle(() => {
            if (!isNil(timer)) clearTimeout(timer);
            if (isOutside) return;
            if (this.toolbar.isHover) return;
            if (this.timeProgress.isHover || this.timeProgress.isSeeking) return;
            if (this.vContainer.isFirstPause) return;

            this.timeProgress.show();
            this.toolbar.show();
            this.$el!.style.cursor = "default";

            timer = setTimeout(() => {
                this.toolbar.hide();
                this.timeProgress.hide();
                this.$el!.style.cursor = "none";
            }, 1500);
        }, 200);
        pIns.$on(Player.EVENT.MOUSE_MOVE, handleContainerMouseMove);
        pIns.$on(Player.EVENT.MOUSE_ENTER, () => (isOutside = false));
        pIns.$on(Player.EVENT.MOUSE_LEAVE, () => {
            isOutside = true;

            if (this.vContainer.isFirstPause) return;
            this.toolbar.hide();
            this.timeProgress.hide();
        });
        pIns.$on(Player.EVENT.CLICK, e => {
            if (e.target !== this.$video || !this.vContainer.isFirstPause) return;
            this.toolbar.hide();
            this.timeProgress.hide();
        });
    }

    $provide(vcIns: VideoController) {
        if (!this.canDo()) return this;
        if (vcIns === this.$player) return this;
        provide("vplayer", vcIns);
        provide("root", this);
        this.$init();
        return this;
    }

    private _fullScreenClassName = "vplayer-fullscreen";
    private _webFullScreenClassName = "vplayer-webfullscreen__fixed";
    exitFullScreen() {
        this.$el?.classList.remove(this._fullScreenClassName, this._webFullScreenClassName);
        if (document.fullscreenElement === this.$el) {
            document.exitFullscreen();
        }
    }
    webFullScreen() {
        this.$el?.classList.remove(this._fullScreenClassName);
        this.$el?.classList.add(this._webFullScreenClassName);
        if (document.fullscreenElement === this.$el) {
            document.exitFullscreen();
        }
    }
    fullScreen() {
        this.$el?.classList.remove(this._webFullScreenClassName);
        this.$el?.classList.add(this._fullScreenClassName);
        this.$el?.requestFullscreen();
    }
}
