import { Component } from "./Component";

export interface Box {
    width: number;
    height: number;
}

export interface $Target {
    readonly $target: Component;
}

export interface Pos {
    x: number;
    y: number;
    z?: number;
}

export interface PosOptions {
    pos: "left" | "center" | "right";
    order: number;
}

export interface $Options {
    readonly $options: PosOptions;
}

export type $ToolBarOptions = $Options;
export type $SideBarOptions = $Options;

export interface PosOptionsWithoutCenterAndTop {
    pos: "left" | "right";
    order: number;
}

export interface $TopBarOptions {
    readonly $options: PosOptionsWithoutCenterAndTop;
}
