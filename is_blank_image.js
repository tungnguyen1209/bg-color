const sharp = require('sharp')

async function isBlankImage(imagePath) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { data } = await image.raw().toBuffer({ resolveWithObject: true });
    return new Promise((resolve, reject) => {
        try {
            for (let i = 0; i < data.length; i += metadata.channels) {
                const alpha = data[i + metadata.channels - 1];
                    const isWhite = data.slice(i, i + metadata.channels - 1).every(val => val === 255);
                if (alpha !== 0 && !isWhite) {
                    resolve(false);
                }
            }
    
            resolve(true);
        } catch (error) {
            reject(false);
        }
    })
}

module.exports = isBlankImage