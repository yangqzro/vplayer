import { EVENT, PLAYER_EVENT, TOOLBAR_POS } from "@/vars";
import { VideoController } from "@/core";
import { ICON } from "../../Icons";
import { $ } from "../../utils/dom";

import template from "./FullScreen.art";
import { $ToolBarOptions, Component, PosOptions } from "../Component";
import { cloneDeep } from "lodash-es";
import { Before, Render } from "../../decorators";

interface FullScreenProps {
    isFullScreen?: boolean;
}

type FullScreenEvents = {
    click: () => void;
};

const defaultOptions: PosOptions = {
    pos: TOOLBAR_POS.RIGHT,
    order: 7,
};

@Render
export class FullScreen extends Component<FullScreenProps, {}, any, FullScreenEvents> implements $ToolBarOptions {
    readonly name: string = "FullScreen";
    protected readonly selector: string = ".vplayer-fullscreen";
    static readonly defaultProps: FullScreenProps = {
        isFullScreen: false,
    };
    static readonly EVENTS = {
        CLICK: "click",
    } as const;

    readonly $options: PosOptions;

    constructor(options: PosOptions = defaultOptions) {
        super();
        this.$options = options;
        this.$props = cloneDeep(FullScreen.defaultProps);
    }

    private get icon() {
        return this.$props.isFullScreen ? ICON.FULLSCREEN_OFF : ICON.FULLSCREEN;
    }

    $render(): string {
        return template(this);
    }

    protected $update(): void {
        ($("img", this.$el!) as HTMLImageElement).src = this.icon;
    }

    $init() {
        this.$el?.addEventListener(EVENT.CLICK, e => {
            this.$emit(FullScreen.EVENTS.CLICK);
        });
    }

    protected $attach(vcIns: VideoController, fsIns: FullScreen): void {
        function setFullScreenProps() {
            fsIns.$setProps(FullScreen.assgin({ isFullScreen: vcIns.isFullScreen }, FullScreen.defaultProps));
        }
        setFullScreenProps();

        vcIns.$on(PLAYER_EVENT.FULL_SCREEN, setFullScreenProps);
        vcIns.$on(PLAYER_EVENT.WEB_FULL_SCREEN, setFullScreenProps);
        vcIns.$on(PLAYER_EVENT.FULL_SCREEN_OFF, setFullScreenProps);

        fsIns.$on(FullScreen.EVENTS.CLICK, () => {
            if (vcIns.isFullScreen) {
                vcIns.exitFullScreen();
            } else {
                vcIns.fullScreen();
            }
        });
    }
}
