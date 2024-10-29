const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const collectionofficerDao = require("../dao/CollectionOfficer-dao");
const collectionofficerValidate = require('../validations/CollectionOfficer-validation');


exports.createCollectionOfficer = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    try {
        // Validate the request body
        // const validatedData = req.body;
        const {officerData, companyData, bankData} = req.body   
        console.log(req.body);
             

        // Call the DAO to create the collection officer
        // const results = await collectionofficerDao.createCollectionOfficerPersonal(Object.values(validatedData));
        const resultsPersonal = await collectionofficerDao.createCollectionOfficerPersonal(officerData, companyData, bankData);
        const resultCompany = await collectionofficerDao.createCollectionOfficerCompany(companyData,resultsPersonal.insertId);
        const resultBank = await collectionofficerDao.createCollectionOfficerBank(bankData,resultsPersonal.insertId);
        
        console.log("Collection Officer created successfully");
        return res.status(201).json({ message: "Collection Officer created successfully", id: resultBank.insertId, status:true });
    } catch (error) {
        if (error.isJoi) {
            // Handle validation error
            return res.status(400).json({ error: error.details[0].message });
        }

        console.error("Error creating collection officer:", error);
        return res.status(500).json({ error: "An error occurred while creating the collection officer" });
    }
};

//get all collection officer
exports.getAllCollectionOfficers = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    try {
        // Validate query parameters
        const validatedQuery = await collectionofficerValidate.getAllCollectionOfficersSchema.validateAsync(req.query);

        const { page, limit, nic } = validatedQuery;

        // Call the DAO to get all collection officers
        const result = await collectionofficerDao.getAllCollectionOfficers(page, limit, nic);

        console.log("Successfully fetched collection officers");
        return res.status(200).json(result);
    } catch (error) {
        if (error.isJoi) {
            // Handle validation error
            return res.status(400).json({ error: error.details[0].message });
        }

        console.error("Error fetching collection officers:", error);
        return res.status(500).json({ error: "An error occurred while fetching collection officers" });
    }
};


exports.getCollectionOfficerReports = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    const { id, date } = req.params;

    try {
        // Validate request parameters
        await collectionofficerValidate.getCollectionOfficerReportsSchema.validateAsync({ id, date });

        // Call DAO to fetch the reports
        const results = await collectionofficerDao.getCollectionOfficerReports(id, date);

        // Create an empty object to store the grouped data
        const groupedData = {};

        // Iterate over the results and group them by cropName
        results.forEach(row => {
            const { cropName, quality, totalQuantity } = row;

            // Initialize an entry for each crop if not already present
            if (!groupedData[cropName]) {
                groupedData[cropName] = { 'Grade A': 0, 'Grade B': 0, 'Grade C': 0, 'Total': 0 };
            }

            // Assign quantity based on quality/grade
            groupedData[cropName][quality] = parseInt(totalQuantity, 10) || 0; 
            groupedData[cropName]['Total'] += parseInt(totalQuantity, 10) || 0; 
        });

        // Send the formatted response
        return res.json(groupedData);
    } catch (error) {
        if (error.isJoi) {
            // Handle validation error
            return res.status(400).json({ error: error.details[0].message });
        }

        console.error("Error fetching collection officer reports:", error);
        return res.status(500).json({ error: "An error occurred while fetching reports" });
    }
};



exports.getCollectionOfficerDistrictReports = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    try {
        // Validate request parameters (district)
        const validatedParams = await collectionofficerValidate.getDistrictReportsSchema.validateAsync(req.params);

        // Fetch the data from the DAO
        const results = await collectionofficerDao.getCollectionOfficerDistrictReports(validatedParams.district);

        console.log("Successfully retrieved reports");
        res.status(200).json(results);
    } catch (error) {
        if (error.isJoi) {
            // Handle validation error
            return res.status(400).json({ error: error.details[0].message });
        }

        console.error("Error retrieving district reports:", error);
        return res.status(500).json({ error: "An error occurred while fetching the reports" });
    }
};
