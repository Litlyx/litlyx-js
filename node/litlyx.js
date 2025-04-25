"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lit = void 0;
const requester_1 = require("./requester");
const utils_1 = require("./utils");
/**
 * Represents a class with functionalities for analytics integration, session management, and event tracking.
 */
class Litlyx {
    project_id;
    initialized = false;
    settings;
    hooked = false;
    /**
     * Initializes the analytics with project ID and optional settings.
     * @param {string} project_id - The project identifier.
     * @param {Settings} [settings] - Optional settings for initialization.
     */
    init(project_id, settings) {
        if (this.initialized)
            return console.warn('Already initialized');
        if (settings?.testMode)
            console.log('INIT');
        this.initialized = true;
        this.project_id = project_id;
        this.settings = {
            testMode: false,
            manualMode: false,
            server: {
                host: 'broker.litlyx.com', port: 443, secure: true
            },
            ...settings
        };
        if (!(0, utils_1.isClient)())
            return;
        if (!this.settings.manualMode) {
            this.pushVisit();
            this.hookHistory();
        }
        (0, requester_1.sendRequest)(project_id, '/keep_alive', { website: location.hostname, userAgent: navigator.userAgent || '', instant: true }, this.settings.server);
        let durationCounter = 0;
        setInterval(() => {
            if (!document.hidden)
                durationCounter += 10;
            if (durationCounter >= 60) {
                durationCounter -= 60;
                (0, requester_1.sendRequest)(project_id, '/keep_alive', { website: location.hostname, userAgent: navigator.userAgent || '' }, this.settings.server);
            }
        }, 1000 * 10);
    }
    hookHistory() {
        if (this.hooked)
            return;
        this.hooked = true;
        const me = this;
        const nativePushState = history.pushState;
        history.pushState = function (data, title, url) {
            nativePushState.apply(this, [data, title, url]);
            me.pushVisit();
        };
        addEventListener('popstate', () => me.pushVisit());
    }
    /**
     *
     * @param {string} name - Name of the event to log
     * @param {EventOptions} options - Optional: push options
     */
    async event(name, options) {
        if (!this.initialized)
            return console.error('Not initialized');
        if (!this.project_id)
            return console.error('project_id is required');
        if (!this.settings)
            return console.error('You must call init before pushing');
        const metadata = options?.metadata ? JSON.stringify(options.metadata) : undefined;
        await (0, requester_1.sendRequest)(this.project_id, '/event', {
            name,
            metadata,
            website: location.host || 'SERVER_SIDE',
            userAgent: navigator.userAgent || 'SERVER_SIDE'
        }, this.settings.server);
    }
    /**
     * Triggers a page visit event using current settings.
     */
    async pushVisit(page) {
        if (!(0, utils_1.isClient)())
            return;
        if (!this.initialized)
            return console.error('Not initialized');
        if (!this.project_id)
            return console.error('project_id is required');
        if (!this.settings)
            return console.error('You must call init before pushing');
        if (!this.initialized)
            return console.error('Not initialized');
        if (!this.project_id)
            return console.error('project_id is required');
        await (0, requester_1.sendRequest)(this.project_id, '/visit', {
            website: location.host,
            page: page ?? location.pathname,
            referrer: document.referrer || 'self',
            userAgent: navigator.userAgent || ''
        }, this.settings.server);
    }
}
/**
 * Singleton instance of LitClass, accessible for import and use in other files.
 */
exports.Lit = new Litlyx();
if ((0, utils_1.isClient)()) {
    // Check if the script is imported with [data-project] and call init
    const scriptElem = document.querySelector('script[data-project]');
    if (scriptElem) {
        const project_id = scriptElem.getAttribute('data-project');
        const host = scriptElem.getAttribute('data-host');
        const port = scriptElem.getAttribute('data-port');
        const secure = scriptElem.getAttribute('data-secure');
        const manual = scriptElem.getAttribute('data-manual');
        if (project_id) {
            console.log('Litlyx init on project', project_id);
            exports.Lit.init(project_id, {
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
