const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const collectionofficerDao = require("../dao/CollectionOfficer-dao");
const collectionofficerValidate = require('../validations/CollectionOfficer-validation');

const Joi = require('joi');


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
        
        const { page, limit, nic, company } = validatedQuery;

        // Call the DAO to get all collection officers
        const result = await collectionofficerDao.getAllCollectionOfficers(page, limit, nic, company);

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


exports.getCollectionOfficerProvinceReports = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);

    try {
        const validatedParams = await collectionofficerValidate.getDistrictProvinceSchema.validateAsync(req.params);

        const results = await collectionofficerDao.getCollectionOfficerProvinceReports(validatedParams.province);        

        console.log("Successfully retrieved reports");
        res.status(200).json(results);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        }

        console.error("Error retrieving district reports:", error);
        return res.status(500).json({ error: "An error occurred while fetching the reports" });
    }
};



exports.getAllCompanyNames = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {
        const results = await collectionofficerDao.getAllCompanyNamesDao();

        console.log("Successfully retrieved reports");
        res.status(200).json(results);
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message });
        }

        console.error("Error retrieving district reports:", error);
        return res.status(500).json({ error: "An error occurred while fetching the reports" });
    }
};


exports.UpdateCollectionOfficerStatus = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {
        const validatedParams = await collectionofficerValidate.UpdateCollectionOfficerStatus.validateAsync(req.params);
        const results = await collectionofficerDao.UpdateCollectionOfiicerStatusDao(validatedParams);

        console.log("Successfully Updated Status",results);
        if(results.affectedRows > 0){
            res.status(200).json({results:results, status:true});
        }else{
            res.json({results:results, status:false});

        }
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message, status:false});
        }

        console.error("Error retrieving Updated Status:", error);
        return res.status(500).json({ error: "An error occurred while Updated Statuss" });
    }
};



exports.deleteCollectionOfficer = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
    try {
        
        const results = await collectionofficerDao.DeleteCollectionOfficerDao(req.params.id);

        console.log("Successfully Delete Status");
        if(results.affectedRows > 0){
            res.status(200).json({results:results, status:true});
        }else{
            res.json({results:results, status:false});

        }
    } catch (error) {
        if (error.isJoi) {
            return res.status(400).json({ error: error.details[0].message, status:false});
        }

        console.error("Error retrieving Updated Status:", error);
        return res.status(500).json({ error: "An error occurred while Updated Statuss" });
    }
};





exports.getOfficerById = async (req, res) => {
    try {
        const id = req.params.id;
        const officerData = await collectionofficerDao.getOfficerById(id);

        if (!officerData) {
            return res.status(404).json({ error: "Collection Officer not found" });
        }

        console.log("Successfully fetched collection officer, company, and bank details");
        res.json({ officerData });
    } catch (err) {
        if (err.isJoi) {
            return res.status(400).json({ error: err.details[0].message });
        }
        console.error("Error executing query:", err);
        res.status(500).send("An error occurred while fetching data.");
    }
};




exports.updateCollectionOfficerDetails = async (req, res) => {
    const { id } = req.params;
    const {  
        centerId,
        firstNameEnglish,
        lastNameEnglish,
        firstNameSinhala,
        lastNameSinhala,
        firstNameTamil,
        lastNameTamil,
        nic,
        email,
        houseNumber,
        streetName,
        city,
        district,
        province,
        country,
        companyNameEnglish,
        companyNameSinhala,
        companyNameTamil,
        IRMname,
        companyEmail,
        assignedDistrict,
        employeeType,
        accHolderName,
        accNumber,
        bankName,
        branchName
    } = req.body;
   
    

    try {
        await collectionofficerDao.updateOfficerDetails(id, 
            centerId,
            firstNameEnglish,
            lastNameEnglish,
            firstNameSinhala,
            lastNameSinhala,
            firstNameTamil,
            lastNameTamil,
            nic,
            email,
            houseNumber,
            streetName,
            city,
            district,
            province,
            country,
            companyNameEnglish,
            companyNameSinhala,
            companyNameTamil,
            IRMname,
            companyEmail,
            assignedDistrict,
            employeeType,
            accHolderName,
            accNumber,
            bankName,
            branchName);
        res.json({ message: 'Collection officer details updated successfully' });
    } catch (err) {
        console.error('Error updating collection officer details:', err);
        res.status(500).json({ error: 'Failed to update collection officer details' });
    }
};
