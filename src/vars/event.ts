export const EVENT = {
    MOUSE_ENTER: "mouseenter",
    MOUSE_LEAVE: "mouseleave",
    MOUSE_DOWN: "mousedown",
    MOUSE_MOVE: "mousemove",
    MOUSE_UP: "mouseup",
    CLICK: "click",
    DB_CLICK: "dbclick",
    FULL_SCREEN_CHANGE: "fullscreenchange",
    CONTEXT_MENU: "contextmenu",
    ANIMATION_END: "animationend",
} as const;

export const VIDEO_EVENT = {
    PLAY: "play",
    PAUSE: "pause",
    LOAD_START: "loadstart",
    VOLUME_CHANGE: "volumechange",
    PLAYING: "playing",
    CAN_PLAY: "canplay",
    PROGRESS: "progress",
    TIME_UP_DATE: "timeupdate",
    RATE_CHANGE: "ratechange",
    CAN_PLAY_THROUGH: "canplaythrough",
    WAITING: "waiting",
    ENTER_PICTURE_IN_PICTURE: "enterpictureinpicture",
    LEAVE_PICTURE_IN_PICTURE: "leavepictureinpicture",
} as const;

export const PLAYER_EVENT = {
    ...VIDEO_EVENT,
    FULL_SCREEN: "fullscreen",
    WEB_FULL_SCREEN: "webfullscreen",
    FULL_SCREEN_OFF: "fullscreenoff",
} as const;
