import { VideoController } from "@/core";
import { Component } from "../Components/Component";
import { attachFrom } from "../utils/attacher";

export function Attacher(target: any, key: string, desc: PropertyDescriptor) {
    const originMethod = desc.value;

    desc.value = function (this: Component, vcIns: VideoController, cIns?: Component) {
        attachFrom(target, this.$player as VideoController, this);
        return originMethod.call(this, vcIns, this);
    };
}
