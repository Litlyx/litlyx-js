import { sendRequest } from "./requester";

import type { EventOptions, Settings } from "./types";

import { isClient } from "./utils";




/**
 * Represents a class with functionalities for analytics integration, session management, and event tracking.
 */
class Litlyx {

    private project_id?: string;
    private initialized: boolean = false;
    private settings?: Required<Settings>;
    private hooked: boolean = false;


    /**
     * Initializes the analytics with project ID and optional settings.
     * @param {string} project_id - The project identifier.
     * @param {Settings} [settings] - Optional settings for initialization.
     */
    init(project_id: string, settings?: Settings) {
        if (this.initialized) return console.warn('Already initialized');

        if (settings?.testMode) console.log('INIT');

        this.initialized = true;
        this.project_id = project_id;

        this.settings = {
            testMode: false,
            server: {
                host: 'broker.litlyx.com', port: 443, secure: true
            },
            ...settings
        }

        if (!isClient()) return;

        this.pushVisit();
        this.hookHistory();

        sendRequest(project_id, '/keep_alive', { website: location.hostname, userAgent: navigator.userAgent || '', instant: true }, this.settings.server);

        setInterval(() => {
            sendRequest(project_id, '/keep_alive', { website: location.hostname, userAgent: navigator.userAgent || '' }, this.settings!.server);
        }, 1000 * 60 * 1)

    }

    private hookHistory() {

        if (this.hooked) return;
        this.hooked = true;

        const me = this;
        const nativePushState = history.pushState;
        history.pushState = function (data: any, title: any, url: any) {
            nativePushState.apply(this, [data, title, url]);
            me.pushVisit();
        }

        addEventListener('popstate', () => me.pushVisit());
    }

    /**
     * 
     * @param {string} name - Name of the event to log
     * @param {EventOptions} options - Optional: push options
     */
    public async event(name: string, options?: EventOptions) {
        if (!this.initialized) return console.error('Not initialized');
        if (!this.project_id) return console.error('project_id is required');
        if (!this.settings) return console.error('You must call init before pushing');

        const metadata = options?.metadata ? JSON.stringify(options.metadata) : undefined;

        await sendRequest(this.project_id, '/event', {
            name,
            metadata,
            website: location.host || 'SERVER_SIDE',
            userAgent: navigator.userAgent || 'SERVER_SIDE'
        }, this.settings.server);
    }

    /**
     * Triggers a page visit event using current settings.
     */
    public async pushVisit() {

        if (!isClient()) return;

        if (!this.initialized) return console.error('Not initialized');
        if (!this.project_id) return console.error('project_id is required');
        if (!this.settings) return console.error('You must call init before pushing');

        if (!this.initialized) return console.error('Not initialized');
        if (!this.project_id) return console.error('project_id is required');

        await sendRequest(this.project_id, '/visit', {
            website: location.host,
            page: location.pathname,
            referrer: document.referrer || 'self',
            userAgent: navigator.userAgent || ''
        }, this.settings.server);

    }


}

/**
 * Singleton instance of LitClass, accessible for import and use in other files.
 */
export const Lit = new Litlyx();



if (isClient()) {
    // Check if the script is imported with [data-project] and call init
    const scriptElem = document.querySelector('script[data-project]');
    if (scriptElem) {
        const project_id = scriptElem.getAttribute('data-project');

        const host = scriptElem.getAttribute('data-host');
        const port = scriptElem.getAttribute('data-port');
        const secure = scriptElem.getAttribute('data-secure');

        if (project_id) {
            Lit.init(project_id, {
                server: {
                    host: host || 'broker.litlyx.com',
                    port: port ? parseInt(port) : 443,
                    secure: secure ? (secure === 'true' ? true : false) : true
                }
            });
        }

    }
}
