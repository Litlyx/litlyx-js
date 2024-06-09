
/**
 * @returns { boolean } - True if the current env is on the browser, false otherwise.
 */
export function isClient() {
    return typeof window === 'object';
}