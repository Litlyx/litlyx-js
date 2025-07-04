import type { EventOptions, Settings } from "./types";
/**
 * Represents a class with functionalities for analytics integration, session management, and event tracking.
 */
declare class Litlyx {
    private workspace_id?;
    private initialized;
    private settings?;
    private hooked;
    /**
     * Initializes the analytics with workspace ID and optional settings.
     * @param {string} workspace_id - The workspace identifier.
     * @param {Settings} [settings] - Optional settings for initialization.
     */
    init(workspace_id: string, settings?: Settings): void;
    private hookHistory;
    /**
     *
     * @param {string} name - Name of the event to log
     * @param {EventOptions} options - Optional: push options
     */
    event(name: string, options?: EventOptions): Promise<void>;
    /**
     * Triggers a page visit event using current settings.
     */
    pushVisit(page?: string): Promise<void>;
}
/**
 * Singleton instance of Litlyx, accessible for import and use in other files.
 */
export declare const Lit: Litlyx;
export {};
