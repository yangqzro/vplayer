declare module "*.art" {
    import { compile } from "art-template";
    const render: ReturnType<typeof compile>;
    export default render;
}

declare module "*.svg" {
    const svg: string;
    export default svg;
}

declare module "*.css" {
    const css: string;
    export default css;
}

declare module "*.less" {
    const less: string;
    export default less;
}
