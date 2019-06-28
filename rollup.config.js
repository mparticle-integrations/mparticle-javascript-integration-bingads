import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
    {
        input: 'src/BingAdsEventForwarder',
        output: {
            file: 'BingAdsEventForwarder.js',
            format: 'iife',
            exports: 'named',
            name: 'mpBingAdsKit',
            strict: false
        },
        plugins: [
            resolve({
                browser: true
            }),
            commonjs()
        ]
    },
    {
        input: 'src/BingAdsEventForwarder',
        output: {
            file: 'dist/BingAdsEventForwarder.js',
            format: 'iife',
            exports: 'named',
            name: 'mpBingAdsKit',
            strict: false
        },
        plugins: [
            resolve({
                browser: true
            }),
            commonjs()
        ]
    },
    {
        input: 'src/BingAdsEventForwarder',
        output: {
            file: 'npm/BingAdsEventForwarder.js',
            format: 'cjs',
            exports: 'named',
            name: 'mpBingAdsKit',
            strict: false
        },
        plugins: [
            resolve({
                browser: true
            }),
            commonjs()
        ]
    }
]