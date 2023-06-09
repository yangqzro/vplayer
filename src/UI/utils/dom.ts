import { error, warn } from "@/shared/error";
import { has, isNil } from "lodash-es";

type Container = HTMLElement | Document | null;
type ResultDOMType = HTMLElement;
const domStorage: Record<string, Map<Container, ResultDOMType>> = {};

export function $(selector: string, container: Container = document) {
    let result: ResultDOMType | undefined | null = null;
    if (has(domStorage, selector)) {
        result = domStorage[selector].get(container);
    }
    if (!isNil(result)) return result;

    result = (container || document).querySelector(selector) as HTMLElement | null;
    if (!isNil(result)) domStorage[selector] = new Map<Container, ResultDOMType>().set(container, result);
    return result;
}

export function getPos(element: HTMLElement, parent: HTMLElement = document.body) {
    if (!parent.contains(element)) {
        error("Parent doesn't contain this element.");
        return null;
    }

    if (element === parent) return { x: 0, y: 0 };

    let x = 0;
    let y = 0;
    let child: HTMLElement | null = element;
    while (child && child !== parent) {
        x += child.offsetLeft;
        y += child.offsetTop;

        child = child.offsetParent as HTMLElement | null;
    }

    return { x, y };
}

export function width(element: HTMLElement) {
    if(element.style.display === 'none') {
        warn("Element isn't rendered, can't get width.");
        return 0;
    }
    const eleInfo = element.getBoundingClientRect();
    return eleInfo.width;
}

export function height(element: HTMLElement) {
    if(element.style.display === 'none') {
        warn("Element isn't rendered, can't get height.");
        return 0;
    }
    const eleInfo = element.getBoundingClientRect();
    return eleInfo.height;
}