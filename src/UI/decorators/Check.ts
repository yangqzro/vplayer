import { Component } from "../Components/Component";

export function Check(target: any, key: string, desc: PropertyDescriptor) {
    const originMethod = desc.value;

    desc.value = function (this: Component, ...args: any[]) {
        if (!this.canDo()) return;
        return originMethod.apply(this, args);
    };

    return desc;
}
