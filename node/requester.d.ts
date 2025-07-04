import { SettingsServer } from './types';
/**
 * @param workspace_id - Workspace id on Litlyx dashboard
 * @param body - Content of the request
 *
 * Send a POST request
 */
export declare function sendRequest(workspace_id: string, endpoint: string, body: Record<string, any>, serverSettings: SettingsServer): void;
