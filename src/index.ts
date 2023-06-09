import { VideoController } from "./core";
import { Player, attach, register } from "./UI";

export default class VPlayer extends VideoController {
    static Player = Player;
    static register = register;
    static attach = attach;
}
