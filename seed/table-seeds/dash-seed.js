const { createSalesAgentTable } = require('../tables/dash-table');
const {createSalesAgentStarTable} = require('../tables/dash-table')


const seedDash = async () => {
    try {
  
    const messageCreateSalesAgentTable = await createSalesAgentTable();
    console.log(messageCreateSalesAgentTable);

    const messageCreateSalesAgentStarTable = await createSalesAgentStarTable();
    console.log(messageCreateSalesAgentStarTable);
    
} catch (err) {
    console.error('Error seeding seedDash:', err);
  }
};

module.exports = seedDash;