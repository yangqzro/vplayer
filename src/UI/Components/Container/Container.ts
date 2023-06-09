import { Component } from "../Component/Component";
import { Render } from "../../decorators";
import template from "./Container.art";
import "./Container.less";
import { VideoController } from "@/core";
import { EVENT } from "@/vars";
import { PlayState } from "./PlayState";
import { Loading } from "./Loading";
import { DanmakuScroller } from "../DanmakuScroller";

type ContainerEvents = {
    click: (e?: Event) => void;
};

@Render
export class Container extends Component<{}, {}, any, ContainerEvents> {
    readonly name: string = "Container";
    protected readonly selector: string = ".vplayer-container";

    static readonly EVENT = {
        CLICK: "click",
    } as const;

    private _playState = new PlayState();
    private _loading = new Loading();
    private _danmakuScroller = new DanmakuScroller();

    $render() {
        return template(this);
    }

    _isFirstPause = true;
    get isFirstPause() {
        return this._isFirstPause;
    }

    click() {
        this.$emit(Container.EVENT.CLICK);
    }

    $init() {
        this._playState.$mountLast(this.$el!);
        this._playState.hide();
        this._loading.$mountLast(this.$el!);
        this._danmakuScroller.$mountLast(this.$el!);
        // this._loading.hide();

        this.$el?.addEventListener(Container.EVENT.CLICK, e => {
            this.$emit(Container.EVENT.CLICK, e);
        });
    }

    protected $attach(vcIns: VideoController, cIns: Container) {
        const self = this;
        function handleDocumentClick() {
            self._isFirstPause = false;
            document.removeEventListener(EVENT.CLICK, handleDocumentClick);
        }
        cIns.$on(Container.EVENT.CLICK, () => {
            if (vcIns.canPlay && vcIns.isPaused) {
                vcIns.play();
                document.addEventListener(EVENT.CLICK, handleDocumentClick);
            } else vcIns.pause();
        });
    }
}
