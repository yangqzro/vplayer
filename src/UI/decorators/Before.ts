import { error } from "@/shared/error";
import { has } from "lodash-es";
import { Component } from "../Components/Component";

export function Before(methodName: string, isValid: boolean = true) {
    return function (target: any, key: string, desc: PropertyDescriptor) {
        const originMethod = desc.value;

        desc.value = function (this: Component, ...args: any[]) {
            if (isValid && !this.canDo()) return;

            if (methodName === key) {
                error(`Can't set method name to ${key}.`);
                return originMethod.apply(this, args);
            }

            if (!has(Object.getPrototypeOf(this), methodName)) {
                error(`Can't find method at ${Component.name}: `, methodName);
            } else {
                const args = methodName === "$attach" ? [this.$player, this] : [];
                (this[methodName as keyof Component] as Function).apply(this, args);
            }
            return originMethod.apply(this, args);
        };

        return desc;
    };
}
