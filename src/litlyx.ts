import type { LitlyxEventOptions, LitlyxSettings } from "./types.d.ts";

/**
 * Represents a class with functionalities for analytics integration, session management, and event tracking.
 */
class Litlyx {

    private workspace_id?: string;
    private settings?: Required<LitlyxSettings>;
    private initialized: boolean = false;
    private hooked: boolean = false;

    public createInstance() {
        return new Litlyx();
    }

    /**
     * Initializes the analytics with workspace ID and optional settings.
     * @param {string} workspace_id - The workspace identifier.
     * @param {Settings} [settings] - Optional settings for initialization.
     */
    init(workspace_id: string, settings?: LitlyxSettings) {
        if (this.initialized) return console.warn('Already initialized');

        if (settings?.debug) console.log('INIT');

        this.initialized = true;
        this.workspace_id = workspace_id;

        this.settings = {
            debug: false,
            manualMode: false,
            server: {
                host: 'broker.litlyx.com', port: 443, secure: true
            },
            ...settings
        }

        if (!this.settings.manualMode) {
            this.pushVisit();
            this.hookHistory();
        }

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
    public async event(name: string, options?: LitlyxEventOptions) {
        if (!this.initialized) return console.error('Not initialized');
        if (!this.workspace_id) return console.error('workspace_id is required');
        if (!this.settings) return console.error('You must call init before pushing');

        const metadata = options?.metadata ? JSON.stringify(options.metadata) : undefined;

        await this.sendRequest(this.workspace_id, '/event', {
            name,
            metadata,
            website: location.host || 'SERVER_SIDE',
            userAgent: navigator.userAgent || 'SERVER_SIDE'
        });
    }

    /**
     * Triggers a page visit event using current settings.
     */
    public async pushVisit(page?: string) {

        if (!this.initialized) return console.error('Not initialized');
        if (!this.workspace_id) return console.error('workspace_id is required');
        if (!this.settings) return console.error('You must call init before pushing');

        const utm_parameters = this.getUTM();

        await this.sendRequest(this.workspace_id, '/visit', {
            website: location.host,
            page: page ?? location.pathname,
            referrer: document.referrer || 'self',
            userAgent: navigator.userAgent || '',
            ...utm_parameters
        });

    }

    private getUTM() {
        try {
            const parsedUrl = new URL(location.href);
            const params = parsedUrl.searchParams;
            const utmParameters: Record<string, string> = {}
            params.forEach((value, key) => {
                if (key.startsWith('utm_')) utmParameters[key] = value;
            });
            return utmParameters;
        } catch (ex) {
            if (this.settings?.debug) console.warn('Error parsing UTM parameters', ex);
            return [];
        }
    }

    private sendRequest(workspace_id: string, endpoint: string, body: Record<string, any>) {
        const serverSettings = this.settings?.server;
        if (!serverSettings) return;
        const protocol = serverSettings.secure ? 'https' : 'http';
        const url = `${protocol}://${serverSettings.host}:${serverSettings.port}${endpoint}`
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, pid: workspace_id })
        }).catch((ex: any) => {
            console.error('ERROR PUSHING', ex);
        });
    }


}

/**
 * Singleton instance of Litlyx, accessible for import and use in other files.
 */
export const Lit = new Litlyx();



// Check if the script is imported with [data-workspace] or [data-project] and call init
const scriptElem = document.querySelector('script[data-workspace]') ?? document.querySelector('script[data-project]');
if (scriptElem) {
    const workspace_id = scriptElem.getAttribute('data-workspace') ?? scriptElem.getAttribute('data-project');

    const host = scriptElem.getAttribute('data-host');
    const port = scriptElem.getAttribute('data-port');
    const secure = scriptElem.getAttribute('data-secure');
    const manual = scriptElem.getAttribute('data-manual');
    const debug = scriptElem.getAttribute('data-debug');

    if (workspace_id) {
        console.log('Litlyx init on workspace', workspace_id);

        Lit.init(workspace_id, {
            manualMode: manual ? (manual === 'true' ? true : false) : false,
            debug: debug ? (debug === 'true' ? true : false) : false,
            server: {
                host: host || 'broker.litlyx.com',
                port: port ? parseInt(port) : 443,
                secure: secure ? (secure === 'true' ? true : false) : true,
            }
        });
    }

}
