import { warn } from "@/shared/error";
import { DanmakuItem } from "@/shared/types";

export class Danmaku {
    private _dmList: DanmakuItem[] = [];

    block() {}

    private _scrollRate: number = 1.0;
    get scrollRate() {
        return this._scrollRate;
    }
    set scrollRate(rate: number) {
        if (rate < 0.5 || rate > 4.0) {
            warn(`Danmaku rate should be between 0.5 and 4.0.`);
        }

        if (rate > 4.0) rate = 4.0;
        else if (rate < 0.5) rate = 0.5;

        this._scrollRate = rate;
    }

    private _opacity: number = 1.0;
    get opacity() {
        return this._opacity;
    }
    set opacity(rate: number) {
        if (rate < 0.0 || rate > 1.0) {
            warn(`Danmaku opacity should be between 0 and 1.`);
        }

        if (rate > 1.0) rate = 1.0;
        else if (rate < 0.0) rate = 0.0;

        this._opacity = rate;
    }

    load(dmList: DanmakuItem[]) {
        this._dmList.push(...dmList);
    }

    reload(dmList: DanmakuItem[]) {
        this._dmList = dmList;
    }

    seek(time: number) {
        return this._dmList.filter(dm => 0 <= dm.time - time && dm.time - time <= 0.3);
    }
}
