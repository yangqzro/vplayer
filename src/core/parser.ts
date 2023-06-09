import { error } from "@/shared/error";
import flvjs from "flv.js";
import { isNil } from "lodash-es";
import { MEDIA_TYPE } from "@/vars";

export function extractType(url: string) {
    // 使用正则提取url的文件类型，flv,mp4等
    if (/\.flv$/i.test(url.toLocaleLowerCase())) return MEDIA_TYPE.FLV;
    return MEDIA_TYPE.NORMAL;
}

export function handleFLV(video: HTMLVideoElement) {
    // @ts-ignore
    const flv = flvjs || window.flvjs;
    if (isNil(flv)) return error("Can't find flv.js.");
    if (!flv.isSupported()) return error("FLV.js is not supported.");

    const flvPlayer = flv.createPlayer({ type: MEDIA_TYPE.FLV, url: video.src });
    flvPlayer.attachMediaElement(video);
    flvPlayer.load();
    return flvPlayer;
}

export function parse(video: HTMLVideoElement) {
    const type = extractType(video.src);
    if (type === MEDIA_TYPE.NORMAL) return;
    if (type === MEDIA_TYPE.FLV) return handleFLV(video);
}
