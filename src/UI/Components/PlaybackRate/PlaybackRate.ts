import { cloneDeep, isNil, throttle } from "lodash-es";

import { PLAYER_EVENT, EVENT, PLAYBACK_RATE, TOOLBAR_POS } from "@/vars";
import { VideoController } from "@/core";
import { $ToolBarOptions, Component, PosOptions } from "../Component";
import { $ } from "../../utils/dom";
import { Render } from "../../decorators";
import { PlaybackRateProps } from "./types";

import template from "./PlaybackRate.art";
import "./PlaybackRate.less";
import { setProps, toString } from "./utils";
import { ChooseDialog } from "./ChooseDialog";

const defaultOptions: PosOptions = {
    pos: TOOLBAR_POS.RIGHT,
    order: 2,
};

@Render
export class PlaybackRate extends Component<PlaybackRateProps> implements $ToolBarOptions {
    readonly name: string = "PlaybackRate";
    protected readonly selector: string = ".vplayer-playbackrate";
    static readonly defaultProps: PlaybackRateProps = {
        currentRate: PLAYBACK_RATE.NORMAL,
    };

    readonly $options: PosOptions;
    constructor(options: PosOptions = defaultOptions) {
        super();
        this.$options = options;
        this.$props = cloneDeep(PlaybackRate.defaultProps);
    }

    private readonly _chooseDialog = new ChooseDialog();

    private get label() {
        return this.$props.currentRate === PLAYBACK_RATE.NORMAL ? "倍数" : toString(this.$props.currentRate);
    }

    $render() {
        return template(this);
    }

    protected $update(): void {
        $("span", this.$el)!.innerHTML = this.label;
    }

    $init() {
        this._chooseDialog.$mountLast(this.$el!);
        this._chooseDialog.hide();

        let timer: number | null = null;
        this.$el?.addEventListener(EVENT.MOUSE_ENTER, () => {
            if (!isNil(timer)) clearTimeout(timer);
            this._chooseDialog.show();
        });

        this.$el?.addEventListener(EVENT.MOUSE_LEAVE, () => {
            timer = setTimeout(() => {
                this._chooseDialog.hide();
            }, 200);
        });
    }

    protected $attach(vcIns: VideoController, tpIns: PlaybackRate) {
        function setPlaybakcRateProps() {
            setProps(vcIns, tpIns, PlaybackRate);
        }
        setPlaybakcRateProps();

        vcIns.$on(PLAYER_EVENT.RATE_CHANGE, setPlaybakcRateProps);
    }
}
