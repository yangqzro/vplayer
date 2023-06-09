export enum FULL_SCREEN_TYPE {
    WEB = "web",
    BROWSER = "browser",
    NONE = "none",
}

export enum MEDIA_TYPE {
    FLV = "flv",
    NORMAL = "normal",
}

export enum PLAYBACK_RATE {
    FASTEST = 2.0,
    FASTER = 1.5,
    FAST = 1.25,
    NORMAL = 1.0,
    SLOW = 0.75,
    SLOWSET = 0.5,
    TRIPLE = 3.0,
}

export type Rate = 0.5 | 0.75 | 1.0 | 1.25 | 1.75 | 2.0 | 3.0;

export enum DANMAKU_TYPE {
    TOP = "top",
    BOTTOM = "bottom",
    SCROLL = "scroll",
}
