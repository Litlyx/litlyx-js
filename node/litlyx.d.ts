import type { EventOptions, Settings } from "./types";
/**
 * Represents a class with functionalities for analytics integration, session management, and event tracking.
 */
declare class Litlyx {
    private project_id?;
    private initialized;
    private settings?;
    private hooked;
    /**
     * Initializes the analytics with project ID and optional settings.
     * @param {string} project_id - The project identifier.
     * @param {Settings} [settings] - Optional settings for initialization.
     */
    init(project_id: string, settings?: Settings): void;
    private hookHistory;
    pushLeave(): Promise<void>;
    /**
     *
     * @param {string} name - Name of the event to log
     * @param {EventOptions} options - Optional: push options
     */
    event(name: string, options?: EventOptions): Promise<void>;
    /**
     * Triggers a page visit event using current settings.
     */
    pushVisit(): Promise<void>;
}
/**
 * Singleton instance of LitClass, accessible for import and use in other files.
 */
export declare const Lit: Litlyx;
export {};
