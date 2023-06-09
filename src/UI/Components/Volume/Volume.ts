import { EVENT, PLAYER_EVENT, TOOLBAR_POS } from "@/vars";
import template from "./Volume.art";
import "./Volume.less";
import { VideoController } from "@/core";
import { ICON } from "../../Icons";
import { $ } from "../../utils/dom";
import { $ToolBarOptions, Component, PosOptions } from "../Component";
import { cloneDeep } from "lodash-es";
import { Before, Render } from "../../decorators";
import { VolumeProps } from "./types";
import { VolumeSlider } from "./VolumeSlider";

type VolumeEvents = {
    click: () => void;
};

const defaultOptions: PosOptions = {
    pos: TOOLBAR_POS.RIGHT,
    order: 3,
};

@Render
export class Volume extends Component<VolumeProps, {}, any, VolumeEvents> implements $ToolBarOptions {
    readonly name: string = "Volume";
    protected selector: string = ".vplayer-volume";
    static defaultProps: VolumeProps = {
        volume: 100,
    };

    static readonly EVENTS = {
        CLICK: "click",
    } as const;

    readonly $options: PosOptions;
    constructor(options: PosOptions = defaultOptions) {
        super();
        this.$options = options;
        this.$props = cloneDeep(Volume.defaultProps);
    }

    private readonly _volumeSlider = new VolumeSlider();

    private get icon() {
        return this.$props.volume === 0 ? ICON.VOLUME_OFF : ICON.VOLUME;
    }

    $render() {
        return template(this);
    }

    protected $update() {
        ($("img", this.$el) as HTMLImageElement).src = this.icon;
    }

    $init() {
        this.$el?.addEventListener(EVENT.CLICK, e => {
            this.$emit(Volume.EVENTS.CLICK);
        });

        this._volumeSlider.$mountLast(this.$el!);
        this._volumeSlider.hide();

        let timer: number | null = null;
        this.$el?.addEventListener(EVENT.MOUSE_ENTER, () => {
            if (timer) clearTimeout(timer);
            this._volumeSlider.show();
        });
        this.$el?.addEventListener(EVENT.MOUSE_LEAVE, () => {
            if (this._volumeSlider.isSliding) return;
            timer = setTimeout(() => {
                this._volumeSlider.hide();
            }, 200);
        });
    }

    protected $attach(vcIns: VideoController, vIns: Volume): void {
        function setVolumeProps() {
            vIns.$setProps(Volume.assgin({ volume: vcIns.volume }, Volume.defaultProps));
        }
        setVolumeProps();

        vcIns.$on(PLAYER_EVENT.VOLUME_CHANGE, setVolumeProps);

        let prevVolume = 0;
        vIns.$on(Volume.EVENTS.CLICK, () => {
            if (vcIns.volume === 0) {
                vcIns.volume = prevVolume;
            } else {
                prevVolume = vcIns.volume;
                vcIns.volume = 0;
            }
        });
    }
}
