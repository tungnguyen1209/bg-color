const addRemoveBackground = require('./add_remove_bg');
const compareHistogram = require('./compare_histogram')
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

// API endpoint for file upload
app.post('/bg-color', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const result = await addRemoveBackground();
    if (result) {
        const correl = compareHistogram();
        res.status(200).json({ correl });
    } else {
        res.status(500).json({ message: 'Failure'});
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});