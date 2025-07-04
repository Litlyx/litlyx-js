"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRequest = void 0;
const utils_1 = require("./utils");
/**
 * @param workspace_id - Workspace id on Litlyx dashboard
 * @param body - Content of the request
 *
 * Send a POST request
 */
function sendRequest(workspace_id, endpoint, body, serverSettings) {
    sendServerRequest(serverSettings.host, endpoint, serverSettings.port, serverSettings.secure, { ...body, pid: workspace_id });
}
exports.sendRequest = sendRequest;
function sendServerRequest(host, path, port, secure, body) {
    try {
        const protocol = secure ? 'https' : 'http';
        if ((0, utils_1.isClient)()) {
            const url = `${protocol}://${host}:${port}${path}`;
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }).catch((ex) => {
                console.error('ERROR PUSHING', ex);
            });
        }
        else {
            const httLib = secure ? require('https') : require('http');
            const req = httLib.request({
                hostname: host, path: path, port: port, method: 'POST', headers: { 'Content-Type': 'application/json' }
            });
            req.on('error', (error) => console.error('ERROR PUSHING', error));
            const requestBody = JSON.stringify(body);
            req.write(requestBody);
            req.end();
        }
    }
    catch (ex) {
        console.error('ERROR PUSHING', ex);
    }
}
