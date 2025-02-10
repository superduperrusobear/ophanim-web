const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const processGltf = gltfPipeline.processGltf;
const options = {
    dracoOptions: {
        compressionLevel: 10,
        quantizePositionBits: 14,
        quantizeNormalBits: 10,
        quantizeTexcoordBits: 12,
        quantizeColorBits: 8,
        quantizeGenericBits: 12,
        unifiedQuantization: true
    }
};

async function compressModel(inputPath, outputPath) {
    try {
        const gltf = fsExtra.readJsonSync(inputPath);
        const results = await processGltf(gltf, options);
        fsExtra.writeJsonSync(outputPath, results.gltf);
        console.log(`Compressed model saved to ${outputPath}`);
    } catch (error) {
        console.error('Error compressing model:', error);
    }
}

// Compress both models
compressModel('public/new/ophanim.gltf', 'public/new/ophanim.compressed.gltf');
compressModel('public/splash/untitled.gltf', 'public/splash/untitled.compressed.gltf'); 