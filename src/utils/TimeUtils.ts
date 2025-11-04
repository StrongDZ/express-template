import { TimeConstants } from "../common/constants/TimeConstants";

export function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
}

export function roundTimestamp(timestamp: number | string, roundTime: number = TimeConstants.A_DAY) {
    timestamp = Math.floor(Number(timestamp));
    const numberUnitRoundTime = Math.floor(timestamp / roundTime);
    return numberUnitRoundTime * roundTime;
}

export function getTimeInterval(interval: string) {
    let now = Date.now();
    let date = new Date(now);

    if (typeof interval != "string") {
        interval = "1m";
    }

    const time = parseInt(interval.substring(0, interval.length - 1));
    const unit = interval.substring(interval.length - 1);

    // minutes
    if (unit == "m") {
        return now - time * 60 * 1000;
    }

    // hours
    if (unit == "h") {
        return now - time * 60 * 60 * 1000;
    }

    // days
    if (unit == "d") {
        return now - time * 24 * 60 * 60 * 1000;
    }

    // week
    if (unit == "w") {
        return now - time * 7 * 24 * 60 * 60 * 1000;
    }

    // month: 1M
    if (unit == "M") {
        let month = date.getMonth();
        let year_minus = parseInt(String(time / 12));
        let new_month = month - (time - year_minus * 12);

        if (new_month < 0) {
            new_month = new_month + 12;
            year_minus = year_minus - 1;
        }
        let year = date.getFullYear();
        date.setMonth(new_month);
        date.setFullYear(year - year_minus);
        return Number(date);
    }

    // year: 1y
    if (unit == "y") {
        let year = date.getFullYear();
        date.setFullYear(year - time);
        return Number(date);
    }

    // others
    return 0;
}
