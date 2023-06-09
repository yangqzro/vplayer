import { groupBy, isNil } from "lodash-es";
import { $ToolBarOptions } from "../Component";
import { Component } from "../Component/Component";
import { Render } from "../../decorators";
import { $ } from "../../utils/dom";

import template from "./ToolBar.art";
import "./ToolBar.less";
import { EVENT } from "@/vars";

export type ToolBarSubComponent = Component & $ToolBarOptions;

@Render
export class ToolBar extends Component {
    readonly name: string = "ToolBar";
    protected readonly selector: string = ".vplayer-toolbar";

    private _isHover = false;
    get isHover() {
        return this._isHover;
    }

    private _left: ToolBarSubComponent[] = [];
    private _center: ToolBarSubComponent[] = [];
    private _right: ToolBarSubComponent[] = [];

    constructor(...components: ToolBarSubComponent[]) {
        super();
        if (components.length === 0) return this;
        const componentsMap = groupBy(components, c => c.$options.pos);
        function sort(c1: ToolBarSubComponent, c2: ToolBarSubComponent) {
            return c1.$options.order - c2.$options.order;
        }
        if (componentsMap.left) this._left = componentsMap.left.sort(sort);
        if (componentsMap.center) this._center = componentsMap.center.sort(sort);
        if (componentsMap.right) this._right = componentsMap.right.sort(sort);
    }

    private get left() {
        return this._left.map(c => c.$render()).join("");
    }

    private get center() {
        return this._center.map(c => c.$render()).join("");
    }

    private get right() {
        return this._right.map(c => c.$render()).join("");
    }

    $render(): string {
        return template(this);
    }

    $init() {
        this.$el?.addEventListener(EVENT.MOUSE_ENTER, () => (this._isHover = true));
        this.$el?.addEventListener(EVENT.MOUSE_LEAVE, () => (this._isHover = false));

        const maxLength = Math.max(this._left.length, this._center.length, this._right.length);
        for (let i = 0; i < maxLength; i++) {
            if (!isNil(this._left[i])) this._left[i].$init();
            if (!isNil(this._center[i])) this._center[i].$init();
            if (!isNil(this._right[i])) this._right[i].$init();
        }
    }

    private _isShow = false;
    show() {
        if (this._isShow) return;
        super.show();
        this.$el?.classList.add("show-below");
        this._isShow = true;
        setTimeout(() => {
            this.$el?.classList.remove("show-below");
        }, 200);
    }

    hide() {
        this.$el?.classList.add("hide-below");
        setTimeout(() => {
            this.$el?.classList.remove("hide-below");
            super.hide();
            this._isShow = false;
        }, 198);
    }
}
