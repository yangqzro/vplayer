import { warn } from "@/shared/error";

export function checkVolume(volume: number) {
    if (volume < 0 || volume > 100) {
        warn(`The volume should be between 1 and 100.`);
    }
}

export function resetVolume(volume: number) {
    if (volume > 100) return 100;
    else if (volume < 0) return 0;
    else return volume;
}
