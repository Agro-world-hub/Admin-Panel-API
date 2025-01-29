const { createSalesAgentTable } = require('../tables/dash-table');
const {createSalesAgentStarTable} = require('../tables/dash-table');
const {createCustomerTable} = require('../tables/dash-table')
const {createHouseTable} = require('../tables/dash-table')
const {createApartmentTable} = require('../tables/dash-table')



const seedDash = async () => {
    try {
  
    const messageCreateSalesAgentTable = await createSalesAgentTable();
    console.log(messageCreateSalesAgentTable);

    const messageCreateSalesAgentStarTable = await createSalesAgentStarTable();
    console.log(messageCreateSalesAgentStarTable);

    const messageCreateCustomerTable = await createCustomerTable();
    console.log(messageCreateCustomerTable);

    const messageCreateHouseTable = await createHouseTable();
    console.log(messageCreateHouseTable);

    const messageCreateApartmentTable = await createApartmentTable();
    console.log(messageCreateApartmentTable);
    
} catch (err) {
    console.error('Error seeding seedDash:', err);
  }
};

module.exports = seedDash;