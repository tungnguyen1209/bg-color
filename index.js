const addRemoveBackground = require('./add_remove_bg');
const compareHistogram = require('./compare_histogram');
const files = require('./files');
const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'images/'); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
    cb(null, file.originalname); // Set unique filenames using timestamps
    },
});

const upload = multer({ storage: storage });

// API endpoint
app.post('/bg-color', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const result = await addRemoveBackground();
        if (result) {
            const colors = await compareHistogram();
             // remove all images
            const removeAllFiles = files.removeAllFiles;
            // removeAllFiles('./images');
            // removeAllFiles('./images_with_background');
            // removeAllFiles('./images_with_no_background');
            res.status(200).json({ 'status': 'Successfully', 'incompatible_colors': colors });
        } else {
            res.status(500).json({ message: 'Failure'});
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Failure'});
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});