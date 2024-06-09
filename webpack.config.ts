import * as path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
    mode: 'production',
    entry: './src/litlyx.ts',
    output: {
        path: path.resolve(__dirname, 'browser'),
        filename: 'litlyx.js',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: { https: false, http: false }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};

export default config;