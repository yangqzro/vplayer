import { Render } from "../../decorators";
import { Component } from "../Component/Component";
import template from "./TopBar.art";
import "./TopBar.less";

interface TopBarOptions {}

@Render
export class TopBar extends Component {
    constructor(options: TopBarOptions) {
        super();
    }

    render(): string {
        return template(null);
    }
}
