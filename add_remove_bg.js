const backGroundColors = require('./colors');
const path = require('path');
const gm = require('gm').subClass({imageMagick: true});
const getAllImages = require('./get_all_files');
const replaceColor = require('replace-color');

const addRemoveBackground = async function() {
    const workDir = path.join(__dirname, './images');
    const images = getAllImages(workDir);
    let addBgResult = true;
    for (let image of images) {
        const size = await getImageSize(image);
        if (size) {
            for(let backgroundColor of backGroundColors) {
                gm(image)
                .background(backgroundColor)
                .extent(size.width, size.height)
                .write(__dirname + '/images_with_background/' + path.parse(image).name + '_' + backgroundColor + '.jpg', function (err) {
                    if (err) addBgResult = false;
                });
            }
        }
    }

    const imagesWithBackground = getAllImages(path.join(__dirname, './images_with_background'));
    let replaceResult = true
    for (let imageWithBackground of imagesWithBackground) {
        const imageName = path.parse(imageWithBackground).name;
        const color = imageName.split('_')[1];
        const replaceImage = await replaceColorImage(imageWithBackground, color);
        if(!replaceImage) {
            replaceResult = false
        }
    }

    return new Promise((resolve, reject) => {
        if (addBgResult && replaceResult) {
            resolve(true)
        }

        reject(false)
    })
}

function getImageSize(imagePath) {
    return new Promise((resolve, reject) => {
        gm(imagePath).size(function (err, size) {
            if (!err) {
                resolve(size)
            }

            reject(false)
        })
    })
}

function replaceColorImage(imageWithBackground, color) {
    return new Promise((resolve, reject) => {
        replaceColor({
            image: imageWithBackground,
            colors: {
                type: 'hex',
                targetColor: color,
                replaceColor: '#00000000'
            },
            deltaE: 10
        })
        .then((jimpObject) => {
            jimpObject.write(__dirname + '/images_with_no_background/' + path.parse(imageWithBackground).name + '.png', (err) => {
                if (err) reject(false);
                resolve(true)
            })
        })
        .catch((err) => {
            reject(false)
        })
    })
}

module.exports = addRemoveBackground