import { cloneDeep } from "lodash-es";
import { VideoController } from "@/core";
import { PLAYER_EVENT, TOOLBAR_POS } from "@/vars";
import { formatTime } from "@/shared/time";
import { Before, Render } from "../../decorators";
import { $ToolBarOptions, Component, PosOptions } from "../Component";
import { $ } from "../../utils/dom";

import template from "./TimeRange.art";
import "./TimeRange.less";

interface TimeRangeProps {
    duration?: number;
    currentTime?: number;
}

const defaultOptions: PosOptions = {
    pos: TOOLBAR_POS.LEFT,
    order: 2,
};

@Render
export class TimeRange extends Component<TimeRangeProps> implements $ToolBarOptions {
    readonly name: string = "TimeRange";
    protected readonly selector: string = ".vplayer-timerange";
    static readonly defaultProps: TimeRangeProps = {
        duration: 0,
        currentTime: 0,
    };

    readonly $options: PosOptions;
    constructor(options: PosOptions = defaultOptions) {
        super();
        this.$options = options;
        this.$props = cloneDeep(TimeRange.defaultProps);
    }

    private get currentTime() {
        return formatTime(this.$props.currentTime || 0);
    }

    private get duration() {
        return formatTime(this.$props.duration || 0);
    }

    $render() {
        return template(this);
    }

    protected $update() {
        $(`${this.selector}__current`, this.$el)!.innerHTML = this.currentTime;
        $(`${this.selector}__duration`, this.$el)!.innerHTML = this.duration;
    }

    protected $attach(vcIns: VideoController, tpIns: TimeRange) {
        function setTimeRangeProps() {
            const props: TimeRangeProps = {
                duration: vcIns.duration,
                currentTime: vcIns.currentTime,
            };
            tpIns.$setProps(TimeRange.assgin(props, TimeRange.defaultProps));
        }
        setTimeRangeProps();

        vcIns.$on(PLAYER_EVENT.TIME_UP_DATE, setTimeRangeProps);
        vcIns.$on(PLAYER_EVENT.PROGRESS, setTimeRangeProps);
    }
}
