export interface DanmakuRaw {
    content: string;
    fontSize: number;
    color: string;
    mode: number;
    weight?: number;
    time: number;
}

export interface DanmakuItem extends DanmakuRaw {
    id: string;
}

export type Rate = 0.5 | 0.75 | 1.0 | 1.25 | 1.75 | 2.0 | 3.0;
