const {
    admin,
    plantcare,
    collectionofficer,
    marketPlace,
    dash,
} = require("../startup/database");

const Joi = require("joi");


const getHouseDetails = () => `
    CASE 
        WHEN c.buildingType = 'House' THEN h.houseNo 
        ELSE NULL 
    END AS houseHouseNo,
    CASE 
        WHEN c.buildingType = 'House' THEN h.streetName 
        ELSE NULL 
    END AS houseStreetName,
    CASE 
        WHEN c.buildingType = 'House' THEN h.city 
        ELSE NULL 
    END AS houseCity
`;

// Function to get apartment details if the customer lives in an apartment
const getApartmentDetails = () => `
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.buildingNo 
        ELSE NULL 
    END AS apartmentBuildingNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.buildingName 
        ELSE NULL 
    END AS apartmentBuildingName,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.unitNo 
        ELSE NULL 
    END AS apartmentUnitNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.floorNo 
        ELSE NULL 
    END AS apartmentFloorNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.houseNo 
        ELSE NULL 
    END AS apartmentHouseNo,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.streetName 
        ELSE NULL 
    END AS apartmentStreetName,
    CASE 
        WHEN c.buildingType = 'Apartment' THEN a.city 
        ELSE NULL 
    END AS apartmentCity
`;

// Function to construct the SQL query
const getAllCustomersQuery = () => `
    SELECT 
        c.id, 
        c.cusId, 
        c.title, 
        c.firstName, 
        c.lastName, 
        c.phoneNumber, 
        c.email, 
        c.buildingType, 
        s.empId AS salesAgentEmpId,  
        s.firstName AS salesAgentFirstName,  
        s.lastName AS salesAgentLastName,  
        c.created_at,
        ${getHouseDetails()},
        ${getApartmentDetails()}
    FROM customer c
    LEFT JOIN salesagent s ON c.salesAgent = s.id  
    LEFT JOIN house h ON c.id = h.customerId AND c.buildingType = 'House'  
    LEFT JOIN apartment a ON c.id = a.customerId AND c.buildingType = 'Apartment'  
    ORDER BY c.created_at DESC
`;

// Function to execute the query and fetch customer data
const getAllCustomers = () => {
    return new Promise((resolve, reject) => {
        dash.query(getAllCustomersQuery(), (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

module.exports = { getAllCustomers };



