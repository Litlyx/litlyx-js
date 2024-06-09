import { isClient } from './utils';

const HOST = 'broker.litlyx.com';

/**
 * @param project_id - Project id on Litlyx dashboard
 * @param body - Content of the request
 * 
 * Send a POST request
 */
export function sendRequest(project_id: string, endpoint: string, body: Record<string, any>, testMode: boolean = false) {
    if (testMode) {
        sendServerRequest('127.0.0.1', endpoint, 8099, false, { ...body, pid: project_id });
    } else {
        sendServerRequest(HOST, endpoint, 443, true, { ...body, pid: project_id });
    }
}


function sendServerRequest(host: string, path: string, port: number, secure: boolean, body: Record<string, any>) {

    try {

        const protocol = secure ? 'https' : 'http';

        if (isClient()) {
            const url = `${protocol}://${host}:${port}${path}`
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }).catch((ex: any) => {
                console.error('ERROR PUSHING', ex);
            });
        } else {
            const httLib = secure ? require('https') : require('http');
            const req = httLib.request({
                hostname: host, path: path, port: port, method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            req.on('error', (error: any) => console.error('ERROR PUSHING', error));
            const requestBody = JSON.stringify(body);
            req.write(requestBody);
            req.end();
        }
    } catch (ex) {
        console.error('ERROR PUSHING', ex)
    }
}
