const jwt = require("jsonwebtoken");
const db = require("../startup/database");
const path = require("path");
const collectionCenterDao = require("../dao/CollectionCenter-dao");
const ValidateSchema = require("../validations/Admin-validation")
const bcrypt = require('bcryptjs')

exports.addNewCollectionCenter = async (req, res) => {
  try {
    const centerData = {
      regCode: req.body.regCode,
      centerName: req.body.centerName,
      contact01: req.body.contact01,
      contact02: req.body.contact02,
      buildingNumber: req.body.buildingNumber,
      street: req.body.street,
      district: req.body.district,
      province: req.body.province,
    };

    const result = await collectionCenterDao.addCollectionCenter(centerData);
    res.status(201).json({
      success: true,
      message: "Collection Center added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding collection center",
      error: error.message,
    });
  }
};
  