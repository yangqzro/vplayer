export const BROWSER = {
    CHROME: "chrome",
    FIREFOX: "firefox",
    SAFARI: "safari",
    UNKNOWN: "unknown",
} as const;

export function browser(): (typeof BROWSER)[keyof typeof BROWSER] {
    const ua = window.navigator.userAgent;
    if (ua.includes(BROWSER.CHROME)) return BROWSER.CHROME;
    if (ua.includes(BROWSER.FIREFOX)) return BROWSER.FIREFOX;
    if (ua.includes(BROWSER.SAFARI)) return BROWSER.SAFARI;
    return BROWSER.UNKNOWN;
}

export const isChrome = browser() === BROWSER.CHROME;
export const isFireFox = browser() === BROWSER.FIREFOX;
export const isSafari = browser() === BROWSER.SAFARI;
