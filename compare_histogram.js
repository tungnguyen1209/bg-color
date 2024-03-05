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

async function compareHistogram() {
    let colors = {}
    const imagesWithNoBackground = getAllFiles(path.join(__dirname, './images_with_no_background'));
    const images = getAllFiles(path.join(__dirname, './images'));
    let result = {};
    for (let image of images) {
        let totalCorrel = 0;
        const hist1 = calculateHistogram(image);
        for (let imageWithNoBackground of imagesWithNoBackground) {
            const isBlank = await isBlankImage(imageWithNoBackground);
            const hist2 = calculateHistogram(imageWithNoBackground);
            const correl = hist1.compareHist(hist2, cv.HISTCMP_CORREL);
            totalCorrel += correl;
            const imageName = path.parse(imageWithNoBackground).name;
            const color = imageName.split('_')[1];
            if (!isBlank) {
                result[color] = correl;
            } else {
                colors[color] = correl;
            }
        }

        const averageCorrel = totalCorrel / 24;
        console.log(result);
        Object.keys(result).forEach(function(key) {
            if (((averageCorrel - result[key]) / averageCorrel ) * 100 > 5) {
                colors[key] = result[key];
            }
        });
    }
    
    return colors;
}


module.exports = compareHistogram