const {
    admin,
    plantcare,
    collectionofficer,
    marketPlace,
    dash,
  } = require("../startup/database");

  const Joi = require("joi");

exports.getAllCustomers = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          c.id, 
          c.cusId, 
          c.title, 
          c.firstName, 
          c.lastName, 
          c.phoneNumber, 
          c.email, 
          c.buildingType, 
          s.empId AS salesAgentEmpId,  -- Get empId from salesagent
          s.firstName AS salesAgentFirstName,  -- Get firstName from salesagent
          s.lastName AS salesAgentLastName,  -- Get lastName from salesagent
          c.created_at 
        FROM customer c
        LEFT JOIN salesagent s ON c.salesAgent = s.id  -- Correctly join salesagent table
        ORDER BY c.created_at DESC`;
  
      dash.query(sql, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };

  
  
  