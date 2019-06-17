import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
    input: 'src/BingAdsEventForwarder.js',
    output: {
        file: 'BingAdsEventForwarder.js',
        format: 'umd',
        exports: 'named',
        name: 'mp-bingAds-kit',
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
    input: 'src/BingAdsEventForwarder.js',
    output: {
        file: 'dist/BingAdsEventForwarder.js',
        format: 'umd',
        exports: 'named',
        name: 'mp-bingAds-kit',
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