function addZeroIfNumLt10(num: number) {
    return num < 10 ? "0" + num : num + "";
}

export function formatTime(time: number) {
    if (Object.is(time, NaN) || time === Infinity || (time = Math.floor(time)) === 0) {
        return "00:00";
    }
    let mintue = Math.floor(time / 60);
    const second = time % 60;
    if (mintue < 60) {
        return [mintue, second].map(addZeroIfNumLt10).join(":");
    }

    let hour = Math.floor(mintue / 60);
    mintue = mintue % 60;
    if (hour < 24) {
        return [hour, mintue, second].map(addZeroIfNumLt10).join(":");
    }

    const day = Math.floor(hour / 24);
    hour = hour % 24;
    return [day, hour, mintue, second].map(addZeroIfNumLt10).join(":");
}
