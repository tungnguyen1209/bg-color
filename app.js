const cv = require('opencv4nodejs');

function countObjects(imagePath) {
  try {
    // Read the image
    const img = cv.imread(imagePath);

    // Convert the image to grayscale
    const grayImg = img.cvtColor(cv.COLOR_BGR2GRAY);

    // Apply GaussianBlur to reduce noise
    const blurredImg = grayImg.gaussianBlur(new cv.Size(5, 5), 0);

    // Use thresholding to create a binary image
    const binaryImg = blurredImg.threshold(100, 255, cv.THRESH_BINARY);

    // Find contours in the binary image
    const contours = binaryImg.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // Draw the contours on the original image
    const imgWithContours = img.drawContours(contours, -1, new cv.Vec3(0, 255, 0), 2);

    // Show the resulting image with highlighted contours
    cv.imshowWait('Objects Image', imgWithContours);

    // Return the number of contours as the number of objects
    return contours.length;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const imagePath1 = './images/6.png';
const imagePath2 = './images_with_no_background/6_#020003.png';
const objectCount = countObjects(imagePath1);
console.log('Number of objects:', objectCount);
