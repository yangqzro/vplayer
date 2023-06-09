import { VideoController } from "@/core";
import { PLAYER_EVENT } from "@/vars";
import { Mount } from "../../../decorators";
import { Component } from "../../Component";

import template from "./PlayState.art";
import "./PlayState.less";
import { ICON } from "../../../Icons";

@Mount
export class PlayState extends Component {
    readonly name: string = "PlayState";
    protected readonly selector: string = ".vplayer-container__playstate";

    private get icon() {
        return ICON.PLAY_FILL;
    }

    $render() {
        return template(this);
    }

    protected $attach(vcIns: VideoController, psIns: PlayState) {
        vcIns.$on(PLAYER_EVENT.CAN_PLAY, () => {
            if (vcIns.isPaused) psIns.show();
        });
        vcIns.$on(PLAYER_EVENT.PAUSE, () => {
            psIns.show();
        });
        vcIns.$on(PLAYER_EVENT.PLAY, () => {
            psIns.hide();
        });
    }
}
