import { VideoController } from "@/core";
import { PLAYER_EVENT } from "@/vars";
import { Mount } from "../../../decorators";
import { Component } from "../../Component";

import { ICON } from "../../../Icons";
import template from "./Loading.art";
import "./Loading.less";

@Mount
export class Loading extends Component {
    readonly name: string = "Loading";
    protected readonly selector: string = ".vplayer-container__loading";

    private get icon() {
        return ICON.LOADING;
    }

    $render() {
        return template(this);
    }

    protected $attach(vcIns: VideoController, lIns: Loading) {
        function hideLoading() {
            lIns.hide();
        }
        vcIns.$on(PLAYER_EVENT.CAN_PLAY, hideLoading);
        vcIns.$on(PLAYER_EVENT.PAUSE, hideLoading);
        vcIns.$on(PLAYER_EVENT.WAITING, () => {
            if (!vcIns.isPaused) lIns.show();
        });
    }
}
