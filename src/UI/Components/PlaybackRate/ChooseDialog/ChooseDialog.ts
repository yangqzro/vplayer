import { VideoController } from "@/core";
import { EVENT, PLAYBACK_RATE, PLAYER_EVENT } from "@/vars";
import { cloneDeep, isNumber } from "lodash-es";
import { Mount } from "../../../decorators";
import { Component } from "../../Component";
import { setProps, toString } from "../utils";
import { PlaybackRateProps, RateCanChoose } from "../types";

import template from "./ChooseDialog.art";
import "./ChooseDialog.less";

type ChooseDialogProps = PlaybackRateProps;
type ChooseDialogEvents = {
    choose: (rate: RateCanChoose) => void;
};

@Mount
export class ChooseDialog extends Component<ChooseDialogProps, {}, any, ChooseDialogEvents> {
    readonly name: string = "ChooseDialog";
    protected readonly selector: string = ".vplayer-playbackrate__dialog";
    static readonly defaultProps: ChooseDialogProps = {
        currentRate: PLAYBACK_RATE.NORMAL,
    };
    protected readonly $props: Readonly<ChooseDialogProps> = cloneDeep(ChooseDialog.defaultProps);

    static readonly EVENT = {
        CHOOSE: "choose",
    } as const;

    private get rates() {
        return Object.values(PLAYBACK_RATE)
            .filter(r => isNumber(r) && r !== 3)
            .map(r => toString(r as RateCanChoose));
    }

    private get currentRate() {
        return toString(this.$props.currentRate);
    }

    $render() {
        return template(this);
    }

    protected $update() {
        const className = "vplayer-playbackrate__dialog-current-item";
        for (let i = 0, len = this.$el!.children.length; i < len; i++) {
            const element = this.$el!.children[i] as HTMLElement;
            element.classList.remove(className);
            if (element.innerText === this.currentRate) {
                element.classList.add(className);
            }
        }
    }

    $init() {
        for (let i = 0, len = this.$el!.children.length; i < len; i++) {
            const element = this.$el!.children[i] as HTMLElement;
            element.addEventListener(EVENT.CLICK, () => {
                const chooseRate = +element.innerText.slice(0, element.innerText.length - 1);
                this.$emit(ChooseDialog.EVENT.CHOOSE, chooseRate as RateCanChoose);
                this.hide();
            });
        }
    }

    protected $attach(vcIns: VideoController, cdIns: ChooseDialog) {
        function setPlaybakcRateProps() {
            setProps(vcIns, cdIns, ChooseDialog);
        }
        setPlaybakcRateProps();

        vcIns.$on(PLAYER_EVENT.RATE_CHANGE, () => {
            setProps(vcIns, cdIns, ChooseDialog);
        });

        cdIns.$on(ChooseDialog.EVENT.CHOOSE, rate => {
            vcIns.playbackRate = rate;
        });
    }
}
