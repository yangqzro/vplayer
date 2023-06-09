import { EVENT, PLAYER_EVENT, TOOLBAR_POS } from "@/vars";
import { VideoController } from "@/core";
import { ICON } from "../../Icons";
import { Render } from "../../decorators";

import template from "./PictureInPicture.art";
import { $ToolBarOptions, Component, PosOptions } from "../Component";

type PictureInPictureEvents = {
    click: () => void;
};

const defaultOptions: PosOptions = {
    pos: TOOLBAR_POS.RIGHT,
    order: 5,
};

@Render
export class PictureInPicture extends Component<{}, {}, any, PictureInPictureEvents> implements $ToolBarOptions {
    readonly name: string = "PictureInPicture";
    protected readonly selector: string = ".vplayer-pip";
    static readonly EVENTS = {
        CLICK: "click",
    } as const;

    readonly $options: PosOptions;
    constructor(options: PosOptions = defaultOptions) {
        super();
        this.$options = options;
    }

    private get icon() {
        return ICON.PIP;
    }

    $render(): string {
        return template(this);
    }

    $init() {
        this.$el?.addEventListener(EVENT.CLICK, e => {
            this.$emit(PictureInPicture.EVENTS.CLICK);
        });
    }

    protected $attach(vcIns: VideoController, pinIns: PictureInPicture): void {
        pinIns.$on(PictureInPicture.EVENTS.CLICK, () => {
            console.log(vcIns.inPip);
            if (vcIns.inPip) {
                vcIns.exitPip();
            } else {
                vcIns.pip();
            }
        });
    }
}
