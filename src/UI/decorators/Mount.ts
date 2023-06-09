import { VideoController } from "@/core";
import { has } from "lodash-es";
import { Component } from "../Components/Component";
import { attachFrom } from "../utils/attacher";

export function Mount<C extends { new (...args: any[]): Component }>(constructor: C) {
    return class extends constructor {
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

        $mountFirst(container: HTMLElement) {
            super.$mountFirst(container);
            this.$init();
        }

        $mountLast(container: HTMLElement) {
            super.$mountLast(container);
            this.$init();
        }

        $mount(container: HTMLElement) {
            super.$mount(container);
            this.$init();
        }
    };
}
