const cv = require('opencv4nodejs');
const getAllImages = require('./get_all_files');
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

function compareHistogram() {
    const imagesWithNoBackground = getAllImages(path.join(__dirname, './images_with_no_background'));
    const images = getAllImages(path.join(__dirname, './images'));
    let result = [];
    for (let imageWithNoBackground of imagesWithNoBackground) {
        for (let image of images) {
            const hist1 = calculateHistogram(image);
            const hist2 = calculateHistogram(imageWithNoBackground);
            const correl = hist1.compareHist(hist2, cv.HISTCMP_CORREL);
            result.push(correl);
        }
    }
    
    return result;
}


module.exports = compareHistogram