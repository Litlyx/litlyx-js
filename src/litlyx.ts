import { sendRequest } from "./requester";

import type { EventOptions, Settings } from "./types";

import { isClient } from "./utils";




/**
 * Represents a class with functionalities for analytics integration, session management, and event tracking.
 */
class Litlyx {

    private workspace_id?: string;
    private initialized: boolean = false;
    private settings?: Required<Settings>;
    private hooked: boolean = false;


    /**
     * Initializes the analytics with workspace ID and optional settings.
     * @param {string} workspace_id - The workspace identifier.
     * @param {Settings} [settings] - Optional settings for initialization.
     */
    init(workspace_id: string, settings?: Settings) {
        if (this.initialized) return console.warn('Already initialized');

        if (settings?.testMode) console.log('INIT');

        this.initialized = true;
        this.workspace_id = workspace_id;

        this.settings = {
            testMode: false,
            manualMode: false,
            server: {
                host: 'broker.litlyx.com', port: 443, secure: true
            },
            ...settings
        }

        if (!isClient()) return;

        if (!this.settings.manualMode) {
            this.pushVisit();
            this.hookHistory();
        }

        sendRequest(workspace_id, '/keep_alive', { website: location.hostname, userAgent: navigator.userAgent || '', instant: true }, this.settings.server);


        let durationCounter = 0;

        setInterval(() => {
            if (!document.hidden) durationCounter += 10;
            if (durationCounter >= 60) {
                durationCounter -= 60;
                sendRequest(workspace_id, '/keep_alive', { website: location.hostname, userAgent: navigator.userAgent || '' }, this.settings!.server);
            }
        }, 1000 * 10)

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
        if (!this.workspace_id) return console.error('workspace_id is required');
        if (!this.settings) return console.error('You must call init before pushing');

        const metadata = options?.metadata ? JSON.stringify(options.metadata) : undefined;

        await sendRequest(this.workspace_id, '/event', {
            name,
            metadata,
            website: location.host || 'SERVER_SIDE',
            userAgent: navigator.userAgent || 'SERVER_SIDE'
        }, this.settings.server);
    }

    /**
     * Triggers a page visit event using current settings.
     */
    public async pushVisit(page?: string) {

        if (!isClient()) return;

        if (!this.initialized) return console.error('Not initialized');
        if (!this.workspace_id) return console.error('workspace_id is required');
        if (!this.settings) return console.error('You must call init before pushing');

        await sendRequest(this.workspace_id, '/visit', {
            website: location.host,
            page: page ?? location.pathname,
            referrer: document.referrer || 'self',
            userAgent: navigator.userAgent || ''
        }, this.settings.server);

    }


}

/**
 * Singleton instance of Litlyx, accessible for import and use in other files.
 */
export const Lit = new Litlyx();


if (isClient()) {
    // Check if the script is imported with [data-workspace] or [data-project] and call init
    const scriptElem = document.querySelector('script[data-workspace]') ?? document.querySelector('script[data-project]');
    if (scriptElem) {
        const workspace_id = scriptElem.getAttribute('data-workspace') ?? scriptElem.getAttribute('data-project');

        const host = scriptElem.getAttribute('data-host');
        const port = scriptElem.getAttribute('data-port');
        const secure = scriptElem.getAttribute('data-secure');
        const manual = scriptElem.getAttribute('data-manual');

        if (workspace_id) {
            console.log('Litlyx init on workspace', workspace_id);

            Lit.init(workspace_id, {
                manualMode: manual ? (manual === 'true' ? true : false) : false,
                server: {
                    host: host || 'broker.litlyx.com',
                    port: port ? parseInt(port) : 443,
                    secure: secure ? (secure === 'true' ? true : false) : true,
                }
            });
        }

    }
}
