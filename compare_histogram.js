const cv = require('opencv4nodejs');
const files = require('./files');
const getAllFiles = files.getAllFiles;
const path = require('path');

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

function compareHistogram() {
    const imagesWithNoBackground = getAllFiles(path.join(__dirname, './images_with_no_background'));
    const images = getAllFiles(path.join(__dirname, './images'));
    let result = {};
    for (let image of images) {
        for (let imageWithNoBackground of imagesWithNoBackground) {
            const hist1 = calculateHistogram(image);
            const hist2 = calculateHistogram(imageWithNoBackground);
            const correl = hist1.compareHist(hist2, cv.HISTCMP_CORREL);
            const imageName = path.parse(imageWithNoBackground).name;
            const color = imageName.split('_')[1];
            result[color] = correl;
        }
    }

    const removeAllFiles = files.removeAllFiles;
    removeAllFiles('./images');
    removeAllFiles('./images_with_background');
    removeAllFiles('./images_with_no_background');
    
    return result;
}


module.exports = compareHistogram