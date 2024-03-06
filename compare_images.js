const cv = require('opencv4nodejs');
const files = require('./files');
const getAllFiles = files.getAllFiles;
const path = require('path');
const isBlankImage = require('./is_blank_image');

function calculateHistogram(imagePath) {
    try {
        const img = cv.imread(imagePath);
        const grayImg = img.cvtColor(cv.COLOR_BGR2GRAY);
        const getHistAxis = new cv.HistAxes({
            channel: 0,
            bins: 256,
            ranges: [0, 256]
        });

        const hist = cv.calcHist(grayImg, [getHistAxis]).convertTo(cv.CV_32F);

        return hist;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function compareImages() {
    let colors = []
    const imagesWithNoBackground = getAllFiles(path.join(__dirname, './images_with_no_background'));
    const images = getAllFiles(path.join(__dirname, './images'));
    let resultChiSquare = {};
    let resultBhattacharyya = {};
    let resultKlDiv = {};
    for (let image of images) {
        let totalChiSquare = 0;
        let totalBhattacharyya = 0;
        let totalKlDiv = 0;
        const hist1 = calculateHistogram(image);
        for (let imageWithNoBackground of imagesWithNoBackground) {
            const isBlank = await isBlankImage(imageWithNoBackground);
            const hist2 = calculateHistogram(imageWithNoBackground);
            const correl = hist1.compareHist(hist2, cv.HISTCMP_CORREL);
            const chiSquare = hist1.compareHist(hist2, cv.HISTCMP_CHISQR);
            const bhattacharyya = hist1.compareHist(hist2, cv.HISTCMP_BHATTACHARYYA);
            const klDiv = hist1.compareHist(hist2, cv.HISTCMP_KL_DIV);

            const imageName = path.parse(imageWithNoBackground).name;
            const color = imageName.split('_')[1];
            if (!isBlank || correl >= 0.9) {
                resultChiSquare[color] = chiSquare;
                totalChiSquare += chiSquare;
                resultBhattacharyya[color] = bhattacharyya;
                totalBhattacharyya += bhattacharyya;
                resultKlDiv[color] = klDiv;
                totalKlDiv += klDiv;
            } else {
                // incompatible if blank image or correl < 0.9
                colors.push(color);
            }
        }
        
        let averageChiSquare = totalChiSquare / (Object.keys(resultChiSquare).length);
        Object.keys(resultChiSquare).forEach(function(key) {
            const threshold = ((averageChiSquare - resultChiSquare[key]) / averageChiSquare ) * 100;
            if (threshold > 40) {
                colors.push(key);
            }
        });

        const averageBhattacharyya = totalBhattacharyya / (Object.keys(resultBhattacharyya).length);
        Object.keys(resultBhattacharyya).forEach(function(key) {
            const threshold = ((resultBhattacharyya[key] - averageBhattacharyya) / averageBhattacharyya ) * 100;
            if (threshold > 6) {
                colors.push(key);
            }
        });

        const averageKlDiv = totalKlDiv / (Object.keys(resultKlDiv).length);
        Object.keys(resultKlDiv).forEach(function(key) {
            const threshold = ((resultKlDiv[key] - averageKlDiv) / averageKlDiv ) * 100;
            if (threshold > 40) {
                colors.push(key);
            }
        });
    }

    uniqueColors = colors.filter(function(elem, pos) {
        return colors.indexOf(elem) == pos;
    })

    return uniqueColors;
}

module.exports = compareImages