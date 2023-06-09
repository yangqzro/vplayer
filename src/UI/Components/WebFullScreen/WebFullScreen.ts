import { EVENT, PLAYER_EVENT, TOOLBAR_POS } from "@/vars";
import { VideoController } from "@/core";
import { cloneDeep } from "lodash-es";
import { ICON } from "../../Icons";
import { $ } from "../../utils/dom";
import { Render } from "../../decorators";

import template from "./WebFullScreen.art";
import { $ToolBarOptions, Component, PosOptions } from "../Component";

interface WebFullScreenProps {
    isWebFullScreen?: boolean;
}

type WebFullScreenEvents = {
    click: () => void;
};

const defaultOptions: PosOptions = {
    pos: TOOLBAR_POS.RIGHT,
    order: 6,
};

@Render
export class WebFullScreen
    extends Component<WebFullScreenProps, {}, any, WebFullScreenEvents>
    implements $ToolBarOptions
{
    readonly name: string = "WebFullScreen";
    protected readonly selector: string = ".vplayer-webfullscreen";
    static readonly defaultProps: WebFullScreenProps = {
        isWebFullScreen: false,
    };
    static readonly EVENTS = {
        CLICK: "click",
    } as const;

    readonly $options: PosOptions;
    constructor(options: PosOptions = defaultOptions) {
        super();
        this.$options = options;
        this.$props = cloneDeep(WebFullScreen.defaultProps);
    }

    private get icon() {
        return this.$props.isWebFullScreen ? ICON.WEBFULLSCREEN_OFF : ICON.WEBFULLSCREEN;
    }

    $render(): string {
        return template(this);
    }

    protected $update(): void {
        ($("img", this.$el!) as HTMLImageElement).src = this.icon;
    }

    $init() {
        this.$el?.addEventListener(EVENT.CLICK, e => {
            this.$emit(WebFullScreen.EVENTS.CLICK);
        });
    }

    protected $attach(vcIns: VideoController, wfsIns: WebFullScreen): void {
        function setWebFullScreenProps() {
            wfsIns.$setProps(
                WebFullScreen.assgin({ isWebFullScreen: vcIns.isWebFullScreen }, WebFullScreen.defaultProps)
            );
        }
        setWebFullScreenProps();

        vcIns.$on(PLAYER_EVENT.WEB_FULL_SCREEN, setWebFullScreenProps);
        vcIns.$on(PLAYER_EVENT.FULL_SCREEN, setWebFullScreenProps);
        vcIns.$on(PLAYER_EVENT.FULL_SCREEN_OFF, setWebFullScreenProps);

        wfsIns.$on(WebFullScreen.EVENTS.CLICK, () => {
            if (vcIns.isWebFullScreen) {
                vcIns.exitFullScreen();
            } else {
                vcIns.webFullScreen();
            }
        });
    }
}
