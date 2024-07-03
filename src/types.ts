
export type SettingsServer = {
    host: string,
    port: number,
    secure: boolean
}

export type Settings = { testMode?: boolean, server?: SettingsServer }
export type EventOptions = { metadata?: Record<string, (string | number)> }
