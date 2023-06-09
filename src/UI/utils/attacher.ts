import { VideoController } from "@/core";
import { Component } from "../Components/Component/Component";

type Attacher = InstanceType<typeof Component>["$attach"];
type Constructor = new (...args: any[]) => Component;
const compStore = new Map<Constructor, Set<Attacher>>();
// const insStore = new Map<Component, Set<Attacher>>();

export function register(comp: Constructor, attacher: Attacher): void;
export function register(comp: Constructor, ...attachers: Attacher[]) {
    if (!compStore.has(comp)) compStore.set(comp, new Set<Attacher>());
    const attacherSet = compStore.get(comp)!;
    for (let i = 0, len = attachers.length; i < len; i++) {
        attacherSet.add(attachers[i]);
    }
}

export function attach(vc: VideoController, cIns: Component) {
    compStore.forEach((attacherSet, Comp) => {
        if (!(cIns instanceof Comp)) return;
        attacherSet.forEach(attacher => attacher.call(cIns, vc, cIns));
    });
}

export function attachFrom(constructor: Constructor, vc: VideoController, cIns: Component) {
    if (!compStore.has(constructor)) return;
    compStore.get(constructor)?.forEach(attacher => attacher.call(cIns, vc, cIns));
}

// export function Attach(target: any, key: string, desc: PropertyDescriptor) {
//     const originMethod = desc.value;

//     desc.value = function (this: Component, vcIns: VideoController, cIns: Component) {
//         attach(this.$player as VideoController, this);
//         return originMethod.call(this, vcIns, cIns);
//     };

//     return desc;
// }

// export function AttachFrom(constructor: Constructor) {
//     return function (target: any, key: string, desc: PropertyDescriptor) {
//         const originMethod = desc.value;

//         desc.value = function (this: Component, vcIns: VideoController, cIns: Component) {
//             attachFrom(constructor, this.$player as VideoController, this);
//             return originMethod.call(this, vcIns, cIns);
//         };

//         return desc;
//     };
// }

// Todo: create a class Decorator which adds '$attach' and '$init' method.

// export function registerInstance(compIns: Component, ...attachers: Attacher[]) {
//     if (!insStore.has(compIns)) insStore.set(compIns, new Set<Attacher>());
//     const attacherSet = insStore.get(compIns)!;

//     if (has(Object.getPrototypeOf(compIns), "$attach")) {
//         attacherSet.add(compIns.$attach);
//     }

//     for (let i = 0, len = attachers.length; i < len; i++) {
//         attacherSet.add(attachers[i]);
//     }

//     compStore.forEach((achSet, Comp) => {
//         if (!(compIns instanceof Comp)) return;
//         achSet.forEach(attacher => attacherSet.add(attacher));
//     });
// }

// export function register(comp: Component): void;
// export function register(comp: (new () => Component) | Component, attacher: Attacher): void;
// export function register(comp: (new () => Component) | Component, ...attachers: Attacher[]) {
//     if (typeof comp !== "function") {
//         registerInstance(comp, ...attachers);
//     } else {
//         // registerComponent(comp, ...attachers);
//     }
// }

// export function attach(vc: VideoController) {
//     insStore.forEach((attacherSet, ins) => {
//         attacherSet.forEach(attacher => attacher.call(ins, vc, ins));
//     });
// }
