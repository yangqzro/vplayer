import { Rate } from "@/vars";

export type RateCanChoose = Exclude<Rate, 3.0>;

export interface PlaybackRateProps {
    currentRate: RateCanChoose;
}
