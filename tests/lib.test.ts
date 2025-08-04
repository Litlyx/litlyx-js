import { Lit } from '../src/Litlyx';

describe('Lib', () => {

    it('should initialize properly', () => {
        const litlyx = Lit.createInstance();
        litlyx.init('123', { debug: true, manualMode: true, server: { host: '123', port: 321, secure: true } });
        expect(litlyx['workspace_id']).toBeDefined();
        expect(litlyx['workspace_id']).toBe('123');
        expect(litlyx['settings']).toBeDefined();
        expect(litlyx['settings']!['debug']).toBe(true);
        expect(litlyx['settings']!['manualMode']).toBe(true);
        expect(litlyx['settings']!['server']).toBeDefined();
        expect(litlyx['settings']!['server']['host']).toBe('123');
        expect(litlyx['settings']!['server']['port']).toBe(321);
        expect(litlyx['settings']!['server']['secure']).toBe(true);
    });

    it('should initialize with default values', () => {

        const fetchMock = jest.fn((...args: any) => {
            return new Promise<void>((resolve, reject) => {
                resolve(args);
            });
        })

        global.fetch = fetchMock as any;

        const litlyx = Lit.createInstance();
        litlyx.init('123');
        expect(litlyx['workspace_id']).toBeDefined();
        expect(litlyx['workspace_id']).toBe('123');
        expect(litlyx['settings']).toBeDefined();
        expect(litlyx['settings']!['debug']).toBe(false);
        expect(litlyx['settings']!['manualMode']).toBe(false);
        expect(litlyx['settings']!['server']).toBeDefined();
        expect(litlyx['settings']!['server']['host']).toBe('broker.litlyx.com');
        expect(litlyx['settings']!['server']['port']).toBe(443);
        expect(litlyx['settings']!['server']['secure']).toBe(true);

        expect(fetchMock).toHaveBeenCalledTimes(1);

        expect(fetchMock).toHaveBeenCalledWith(
            'https://broker.litlyx.com:443/visit',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{"website":"localhost","page":"/","referrer":"self","userAgent":"Mozilla/5.0 (win32) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0","pid":"123"}'
            }
        );

    });

    it('should send visit', () => {

        const fetchMock = jest.fn((...args: any) => {
            return new Promise<void>((resolve, reject) => {
                resolve(args);
            });
        })

        global.fetch = fetchMock as any;

        const litlyx = Lit.createInstance();
        litlyx.init('123', { manualMode: true });

        litlyx.pushVisit('/my_page');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://broker.litlyx.com:443/visit',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{"website":"localhost","page":"/my_page","referrer":"self","userAgent":"Mozilla/5.0 (win32) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0","pid":"123"}'
            }
        );

    });

    it('should send event', () => {

        const fetchMock = jest.fn((...args: any) => {
            return new Promise<void>((resolve, reject) => {
                resolve(args);
            });
        })

        global.fetch = fetchMock as any;

        const litlyx = Lit.createInstance();
        litlyx.init('123', { manualMode: true });

        litlyx.event('test_event', { metadata: { test_n: 123, test_s: '123' } })

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://broker.litlyx.com:443/event',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{"name":"test_event","metadata":"{\\"test_n\\":123,\\"test_s\\":\\"123\\"}","website":"localhost","userAgent":"Mozilla/5.0 (win32) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0","pid":"123"}'
            }
        );

    });

})