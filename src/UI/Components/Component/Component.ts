import { isEqual, isNil, cloneDeep } from "lodash-es";
import { Events, type EventsDefaultDef } from "@/events";
import { error, warn } from "@/shared/error";
import { inject } from "@/shared/transfer";
import { VideoController } from "@/core";
import { $, getPos } from "../../utils/dom";
import { Reactive, reactive, watch } from "@/shared/reactive";
import { Player } from "../../Player";
import { addUpdateQueue } from "../../utils/updateQueue";
import { Box, Pos } from "./types";

const stateStorage = new WeakMap<object, Reactive>();

export interface Component<
    PropsType extends object = {},
    StateType extends object = {},
    DataType = any,
    EventsType extends EventsDefaultDef = EventsDefaultDef
> extends Events<EventsType> {}
export class Component<PropsType, StateType, DataType, EventsType> extends Events<EventsType> {
    readonly name: string = "Component";

    protected get $player() {
        return inject("vplayer") as Readonly<VideoController> | null;
    }
    // protected _playerEvents: Record<string, Set<() => void>> = {};
    // addPlayerEvent<E extends string, K extends (...args: any) => any>(vc: VideoController, event: E, callback: K) {
    //     vc.$on(event, callback);
    //     if (!has(this._playerEvents, event)) this._playerEvents[event] = new Set<K>();
    //     this._playerEvents[event].add(callback);
    // }

    protected get $root() {
        return inject("root") as Readonly<Player> | null;
    }

    protected _isMounted: boolean = false;
    get isMounted() {
        return this._isMounted;
    }

    static readonly defaultProps: object = {};
    static assgin<T extends object>(props: T, defaultProps: T) {
        if (isNil(defaultProps)) return props;
        return { ...cloneDeep(defaultProps), ...props };
    }
    protected $props: Readonly<PropsType> = {} as PropsType;
    $setProps(props: PropsType) {
        if (isEqual(this.$props, props)) return;
        this.$props = props;
        if (this.canUpdate()) addUpdateQueue(this, this.$update.bind(this));
    }

    protected readonly initialState: Readonly<StateType> = {} as StateType;
    private $setState<T extends object>(raw: T): Reactive<T> {
        if (stateStorage.has(raw)) {
            return stateStorage.get(raw) as Reactive<T>;
        }
        const result = reactive(raw);
        stateStorage.set(raw, result);
        watch(result, () => {
            if (this.canUpdate()) addUpdateQueue(this, this.$update.bind(this));
        });
        return result;
    }
    protected get $state(): Reactive<StateType> {
        return this.$setState(this.initialState);
    }

    protected $data: Readonly<DataType> = {} as DataType;
    $setData(data: DataType) {
        this.$data = data;
    }

    protected readonly selector: string = "";
    protected get $el() {
        const el = $(this.selector) as HTMLElement | null;
        if (isNil(el)) {
            warn(`Can't find element for selector: ${this.selector}. Maybe ${this.name} isn't mounted.`);
        }
        return el;
    }

    private _container: HTMLElement | null = null;
    protected get $container() {
        return this._container || (this.$el?.parentElement as HTMLElement | null);
    }

    $render() {
        error(`${this.name}'s render method didn't implement.`);
        return "";
    }

    $mountFirst(container: HTMLElement) {
        this._container = container;
        const ele = document.createElement("div");
        this._container.insertBefore(ele, this._container.firstElementChild);
        ele.outerHTML = this.$render();
        this._isMounted = true;
    }

    $mountLast(container: HTMLElement) {
        this._container = container;
        const ele = document.createElement("div");
        this._container.appendChild(ele);
        ele.outerHTML = this.$render();
        this._isMounted = true;
    }

    $mount(container: HTMLElement) {
        this._container = container;
        this._container.innerHTML = this.$render();
        this._isMounted = true;
    }

    protected canUpdate() {
        return this.isMounted;
    }

    protected $update() {
        error(`${this.name}'s update method didn't implement.`);
    }

    protected canDo() {
        const result = this.isMounted;
        if (!result) {
            error(`${this.name} isn't mounted.`);
        }
        return result;
    }

    $init() {
        error(`${this.name}'s init method didn't implement.`);
    }

    protected $attach(vcIns: VideoController, compIns?: Component) {
        error(`${this.name}'s attach method didn't implement.`);
    }

    hide() {
        if (!this.canDo()) return;
        this.$el!.style.display = "none";
    }

    show() {
        if (!this.canDo()) return;
        this.$el!.style.display = "";
    }

    $destroy() {
        // remove all events of Component
        this.$off();

        // unmount Component and remove it from dom
        if (this.isMounted) {
            this.$container!.removeChild(this.$el!);
        }

        // remove all events which is registered by this Component instance in Player
        // if (isEqual(this._playerEvents, {})) return;
        // Object.keys(this._playerEvents).forEach(event => {
        //     const cbSet = this._playerEvents[event];
        //     cbSet.forEach(cb => this.$player.$off(event, cb));
        //     delete this._playerEvents[event];
        // });
    }
}
