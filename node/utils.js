"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClient = void 0;
/**
 * @returns { boolean } - True if the current env is on the browser, false otherwise.
 */
function isClient() {
    return typeof window === 'object';
}
exports.isClient = isClient;
