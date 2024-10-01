
const jwt = require("jsonwebtoken");
const db = require('../startup/database');
const bodyParser = require('body-parser');
const path = require("path");
const newsDao = require("../dao/News-dao");
const newsValidate = require('../validations/News-validation');



const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const xlsx = require("xlsx");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

exports.deleteNews = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log('Request URL:', fullUrl);

    const { id } = req.params;

    try {
        // Validate request parameters
        await newsValidate.deleteNewsSchema.validateAsync({ id });

        // Call DAO to delete the news
        const results = await newsDao.deleteNews(id);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'News not found' });
        }

        console.log('News deleted successfully');
        return res.status(200).json({ message: 'News deleted successfully' });
    } catch (error) {
        if (error.isJoi) {
            // Handle validation error
            return res.status(400).json({ error: error.details[0].message });
        }

        console.error('Error deleting news:', error);
        return res.status(500).json({ error: 'An error occurred while deleting news' });
    }
};




exports.editNews = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { titleEnglish, titleSinhala, titleTamil, descriptionEnglish, descriptionSinhala, descriptionTamil } = req.body;
    const { id } = req.params;

    try {
        // Validate request body
        await newsValidate.editNewsSchema.validateAsync(req.body);

        let imageData = null;
        if (req.file) {
            imageData = req.file.buffer; // Store the binary image data from req.file
        }
        // Call DAO to update the news
        const results = await newsDao.updateNews({ titleEnglish, titleSinhala, titleTamil, descriptionEnglish, descriptionSinhala, descriptionTamil, image: imageData }, id);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'News not found' });
        }

        console.log("News updated successfully");
        return res.status(200).json({ message: "News updated successfully" });
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        console.error("Error updating news:", error);
        return res.status(500).json({ error: "An error occurred while updating news" });
    }
};