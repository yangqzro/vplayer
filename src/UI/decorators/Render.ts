import { VideoController } from "@/core";
import { has } from "lodash-es";
import { Component } from "../Components/Component";
import { attachFrom } from "../utils/attacher";

export function Render<C extends { new (...args: any[]): Component }>(constructor: C) {
    return class extends constructor {
        get isMounted(): boolean {
            return !!(this._isMounted || this.$root?.isMounted);
        }

        $init() {
            if (!this.canDo()) return;
            this.$attach(this.$player as VideoController, this);
            if (has(constructor.prototype, "$init")) {
                super.$init();
            }
        }

        protected $attach(vcIns: VideoController, compIns?: Component) {
            attachFrom(constructor, vcIns, this);
            if (has(constructor.prototype, "$attach")) {
                super.$attach(vcIns, this);
            }
        }
    };
}
