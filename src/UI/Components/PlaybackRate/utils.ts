import { VideoController } from "@/core";
import { PLAYBACK_RATE } from "@/vars";
import { isInteger } from "lodash-es";
import { Component } from "../Component";
import { RateCanChoose } from "./types";

export function setProps<C extends { new (...args: any[]): Component; defaultProps?: any }>(
    vcIns: VideoController,
    ins: Component,
    constructor: C
) {
    const currentRate = vcIns.playbackRate as PLAYBACK_RATE;
    if (Object.values(PLAYBACK_RATE).includes(currentRate) && currentRate !== 3.0) {
        const props = { currentRate: currentRate as RateCanChoose };
        ins.$setProps(Component.assgin(props, constructor.defaultProps));
    }
}

export function toString(rate: RateCanChoose) {
    if(isInteger(rate)) return rate.toFixed(1) + 'x';
    return rate + "x";
}
