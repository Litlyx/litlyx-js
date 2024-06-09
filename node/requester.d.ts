/**
 * @param project_id - Project id on Litlyx dashboard
 * @param body - Content of the request
 *
 * Send a POST request
 */
export declare function sendRequest(project_id: string, endpoint: string, body: Record<string, any>, testMode?: boolean): void;
