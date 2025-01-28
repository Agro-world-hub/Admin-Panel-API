const { createAdminUserRolesTable } = require('../tables/admin-table');
const { createAdminUserPositionTable } = require('../tables/admin-table');
const { createFeaturesTable } = require('../tables/admin-table');
const { createAdminUsersTable } = require('../tables/admin-table');
const { createRoleFeatures } = require('../tables/admin-table');

const {createSuperAdmin} = require('../data/admin')
const {insertRoles} = require('../data/adminRoles')
const {insertPositions} = require('../data/adminPositions')


const seedAdmin = async () => {
    try {
  
    const messageCreateAdminUserRolesTable = await createAdminUserRolesTable();
    console.log(messageCreateAdminUserRolesTable);

    const messageCreateAdminUserPositionTable = await createAdminUserPositionTable();
    console.log(messageCreateAdminUserPositionTable);

    const messageCreateFeaturesTable = await createFeaturesTable();
    console.log(messageCreateFeaturesTable);

    const messageCreateAdminUsersTable = await createAdminUsersTable();
    console.log(messageCreateAdminUsersTable);

    const messageCreateRoleFeatures = await createRoleFeatures();
    console.log(messageCreateRoleFeatures);




    




    const messageInsertRoles = await insertRoles();
    console.log(messageInsertRoles);
    const messageinsertPositions = await insertPositions();
    console.log(messageinsertPositions);
    const messageAdminCreate = await createSuperAdmin();
    console.log(messageAdminCreate);
    
} catch (err) {
    console.error('Error seeding seedAdmin:', err);
  }
};

module.exports = seedAdmin;