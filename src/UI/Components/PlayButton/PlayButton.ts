import { EVENT, PLAYER_EVENT, TOOLBAR_POS } from "@/vars";
import { ICON } from "../../Icons";
import { $ } from "../../utils/dom";
import { VideoController } from "@/core";
import { $ToolBarOptions, Component, PosOptions } from "../Component";
import { cloneDeep } from "lodash-es";
import { Render } from "../../decorators";
import template from "./PlayButton.art";
import "./PlayButton.less";

interface PlayButtonProps {
    isPaused?: boolean;
}

type PlayButtonEvents = {
    click: () => void;
};

const defaultOptions: PosOptions = {
    pos: TOOLBAR_POS.LEFT,
    order: 1,
};

@Render
export class PlayButton extends Component<PlayButtonProps, {}, any, PlayButtonEvents> implements $ToolBarOptions {
    readonly name: string = "PlayButton";
    protected readonly selector: string = ".vplayer-playstate";
    static readonly defaultProps: Readonly<PlayButtonProps> = {
        isPaused: true,
    };

    static readonly EVENTS = {
        CLICK: "click",
    } as const;

    readonly $options: PosOptions;

    constructor(options: PosOptions = defaultOptions) {
        super();
        this.$options = options;
        this.$props = cloneDeep(PlayButton.defaultProps);
    }

    private get icon() {
        return this.$props.isPaused ? ICON.PAUSE : ICON.PLAY;
    }

    $render() {
        return template(this);
    }

    protected $update() {
        ($("img", this.$el) as HTMLImageElement).src = this.icon;
    }

    $init() {
        this.$el?.addEventListener(EVENT.CLICK, e => {
            this.$emit(PlayButton.EVENTS.CLICK);
        });
    }

    protected $attach(vcIns: VideoController, pbIns: PlayButton) {
        function setPlatButtonProps() {
            pbIns.$setProps(PlayButton.assgin({ isPaused: vcIns.isPaused }, PlayButton.defaultProps));
        }
        setPlatButtonProps();

        vcIns.$on(PLAYER_EVENT.PLAY, setPlatButtonProps);
        vcIns.$on(PLAYER_EVENT.PAUSE, setPlatButtonProps);

        pbIns.$on(PlayButton.EVENTS.CLICK, () => {
            this.$root?.vContainer.click();
        });
    }
}
