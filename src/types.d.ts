
export type LitlyxSettingsServer = {
    host: string,
    port: number,
    secure: boolean
}

export type LitlyxSettings = {
    debug?: boolean,
    server?: LitlyxSettingsServer,
    manualMode?: boolean
}

export type LitlyxEventOptions = {
    metadata?: Record<string, (string | number)>
}
