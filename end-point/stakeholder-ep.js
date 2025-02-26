const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { log } = require("console");
const StakeholderDao = require("../dao/Stakeholder-dao");
const ValidateSchema = require("../validations/Admin-validation");
const { type } = require("os");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");

exports.getAdminUserData = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {

        const adminUsersByPosition = await StakeholderDao.getAdminUsersByPosition();
        const TodayAdminUsers = await StakeholderDao.getTodayRegAdmin();

        const newAdminUsers = await StakeholderDao.getNewAdminUsers();
        const allAdminUsers = await StakeholderDao.getAllAdminUsers();
  
    //   const result = await ComplainCategoryDAO.getAllSystemApplicationData();
    //   console.log('dfdgdgd', adminUsersByPosition, newAdminUsers, allAdminUsers);
  
    //   console.log("Successfully fetched collection officers");
    //   return res.status(200).json(adminUsersByPosition, newAdminUsers, allAdminUsers);
    // return res.status(200).json({newAdminUsers, allAdminUsers, adminUsersByPosition});
    res.status(200).json(
      {
        firstRow:{
        adminUsersByPosition:adminUsersByPosition, 
        todayAdmin:TodayAdminUsers 
      }
    })
    } catch (error) {
  
  
      console.error("Error fetching collection officers:", error);
      return res.status(500).json({ error: "An error occurred while fetching collection officers" });
    }
  };

  exports.getCollectionOfficerData = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {

        const collectionOfficersByPosition = await StakeholderDao.getCollectionOfficersByPosition();
        const newCollectionOfficers = await StakeholderDao.getNewCollectionOfficers();
        const allCollectionOfficers = await StakeholderDao.getAllCollectionOfficers();
        const activeCollectionOfficers = await StakeholderDao.getActiveCollectionOfficers();
  
    //   const result = await ComplainCategoryDAO.getAllSystemApplicationData();
    //   console.log('dfdgdgd', adminUsersByPosition, newAdminUsers, allAdminUsers);
  
    //   console.log("Successfully fetched collection officers");
      return res.status(200).json({collectionOfficersByPosition, newCollectionOfficers, allCollectionOfficers, activeCollectionOfficers});
    } catch (error) {
  
  
      console.error("Error fetching collection officers:", error);
      return res.status(500).json({ error: "An error occurred while fetching collection officers" });
    }
  };

  exports.getPlantCareUserData = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {

        const plantCareUserByQrRegistration = await StakeholderDao.getPlantCareUserByQrRegistration();
        const newPlantCareUsers = await StakeholderDao.getNewPlantCareUsers();
        const allPlantCareUsers = await StakeholderDao.getAllPlantCareUsers();
        const activePlantCareUsers = await StakeholderDao.getActivePlantCareUsers();
  
    //   const result = await ComplainCategoryDAO.getAllSystemApplicationData();
    //   console.log('dfdgdgd', adminUsersByPosition, newAdminUsers, allAdminUsers);
  
    //   console.log("Successfully fetched collection officers");
      return res.status(200).json({plantCareUserByQrRegistration, newPlantCareUsers, allPlantCareUsers, activePlantCareUsers});
    } catch (error) {
  
  
      console.error("Error fetching collection officers:", error);
      return res.status(500).json({ error: "An error occurred while fetching collection officers" });
    }
  };

  exports.getSalesAgentData = async (req, res) => {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log(fullUrl);
  
    try {

        const activeSalesAgents = await StakeholderDao.getActiveSalesAgents();
        const newSalesAgents = await StakeholderDao.getNewSalesAgents();
        const allSalesAgents = await StakeholderDao.getAllSalesAgents();
  
    //   const result = await ComplainCategoryDAO.getAllSystemApplicationData();
    //   console.log('dfdgdgd', adminUsersByPosition, newAdminUsers, allAdminUsers);
  
    //   console.log("Successfully fetched collection officers");
      return res.status(200).json({activeSalesAgents, newSalesAgents, allSalesAgents});
    } catch (error) {
  
  
      console.error("Error fetching collection officers:", error);
      return res.status(500).json({ error: "An error occurred while fetching collection officers" });
    }
  };

  