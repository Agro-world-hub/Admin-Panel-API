const { createUsersTable } = require('../tables/plantCare-table');
const { createAdminUserRolesTable } = require('../tables/plantCare-table');
const { createAdminUsersTable } = require('../tables/plantCare-table');
const { createContentTable } = require('../tables/plantCare-table');
const { createCropGroup } = require('../tables/plantCare-table');
const { createCropVariety } = require('../tables/plantCare-table');
const { createCropCalenderTable } = require('../tables/plantCare-table');
const { createCropCalenderDaysTable } = require('../tables/plantCare-table');
const { createOngoingCultivationsTable } = require('../tables/plantCare-table');
const { createOngoingCultivationsCropsTable } = require('../tables/plantCare-table');
const { createpublicforumposts } = require('../tables/plantCare-table');
const { createpublicforumreplies } = require('../tables/plantCare-table');
const { createFixedAsset } = require('../tables/plantCare-table');
const { createBuldingFixedAsset } = require('../tables/plantCare-table');
const { createLandFixedAsset } = require('../tables/plantCare-table');
const { createMachToolsFixedAsset } = require('../tables/plantCare-table');
const { createMachToolsWarrantyFixedAsset } = require('../tables/plantCare-table');
const { createOwnershipOwnerFixedAsset } = require('../tables/plantCare-table');
const { createOwnershipLeastFixedAsset } = require('../tables/plantCare-table');
const { createOwnershipPermitFixedAsset } = require('../tables/plantCare-table');
const { createOwnershipSharedFixedAsset } = require('../tables/plantCare-table');
const { createCurrentAssetRecord } = require('../tables/plantCare-table');
const { createCurrentAssetTable } = require('../tables/plantCare-table');
const { createSlaveCropCalenderDaysTable } = require('../tables/plantCare-table');
const { createCropGeoTable } = require('../tables/plantCare-table');
const { createTaskImages } = require('../tables/plantCare-table');
const { createUserBankDetails } = require('../tables/plantCare-table');

const { createFeedBackListTable } = require('../tables/plantCare-table');
const { createDeletedUserTable } = require('../tables/plantCare-table');
const { createUserFeedbackTable } = require('../tables/plantCare-table');



const {createSuperAdmin} = require('../data/admin')
const {insertRoles} = require('../data/adminRoles')


    


const seedPlantCare = async () => {
  try {
    const messagecreateUsersTable = await createUsersTable();
    console.log(messagecreateUsersTable);

    const messagecreateAdminUserRolesTables = await createAdminUserRolesTable();
    console.log(messagecreateAdminUserRolesTables);

    const messagecreateAdminUsersTable = await createAdminUsersTable();
    console.log(messagecreateAdminUsersTable);

    const messagecreateContentTable = await createContentTable();
    console.log(messagecreateContentTable);

    const messagecreateCropGroup = await createCropGroup();
    console.log(messagecreateCropGroup);

    const messagecreateCropVariety = await createCropVariety();
    console.log(messagecreateCropVariety);

    const messagecreateCropCalenderTable = await createCropCalenderTable();
    console.log(messagecreateCropCalenderTable);

    const messagecreateCropCalenderDaysTable = await createCropCalenderDaysTable();
    console.log(messagecreateCropCalenderDaysTable);

    const messagecreateOngoingCultivationsTable = await createOngoingCultivationsTable();
    console.log(messagecreateOngoingCultivationsTable);

    const createOngoingCultivationsCro = await createOngoingCultivationsCropsTable();
    console.log(createOngoingCultivationsCro);

    const messageCurrentAsset = await createCurrentAssetTable();
    console.log(messageCurrentAsset);

    const messageCreateChatHeadTable = await createpublicforumposts();
    console.log(messageCreateChatHeadTable);

    const messageCreateReplyChat = await createpublicforumreplies();
    console.log(messageCreateReplyChat);

    const messageFixedAsset = await createFixedAsset();
    console.log(messageFixedAsset);

    const messagecreateBuldingFixedAsset = await createBuldingFixedAsset();
    console.log(messagecreateBuldingFixedAsset);

    const messagecreateLandFixedAsset = await createLandFixedAsset();
    console.log(messagecreateLandFixedAsset);

    const messagecreateMachToolsFixedAsset = await createMachToolsFixedAsset();
    console.log(messagecreateMachToolsFixedAsset);

    const messagecreateMachToolsWarrantyFixedAsset = await createMachToolsWarrantyFixedAsset();
    console.log(messagecreateMachToolsWarrantyFixedAsset);

    const messagecreateOwnershipOwnerFixedAsset = await createOwnershipOwnerFixedAsset();
    console.log(messagecreateOwnershipOwnerFixedAsset);

    const messagecreateOwnershipLeastFixedAsset = await createOwnershipLeastFixedAsset();
    console.log(messagecreateOwnershipLeastFixedAsset);

    const messagecreateOwnershipPermitFixedAsset = await createOwnershipPermitFixedAsset();
    console.log(messagecreateOwnershipPermitFixedAsset);

    const messagecreateOwnershipSharedFixedAsset = await createOwnershipSharedFixedAsset();
    console.log(messagecreateOwnershipSharedFixedAsset);

    const messagecreateCurrentAssetRecord = await createCurrentAssetRecord();
    console.log(messagecreateCurrentAssetRecord);

    const messageSlaveCropCalenderDaysTable = await createSlaveCropCalenderDaysTable();
    console.log(messageSlaveCropCalenderDaysTable);

    const messageCreateCropGeoTable = await createCropGeoTable();
    console.log(messageCreateCropGeoTable);

    const messageCreateTaskImages= await createTaskImages();
    console.log(messageCreateTaskImages);

    const messageCreateUserBankDetails = await createUserBankDetails();
    console.log(messageCreateUserBankDetails);







    const messageCreateFeedBackListTable = await createFeedBackListTable();
    console.log(messageCreateFeedBackListTable);

    const messageCreateDeletedUserTable= await createDeletedUserTable();
    console.log(messageCreateDeletedUserTable);

    const messageCreateUserFeedbackTable = await createUserFeedbackTable();
    console.log(messageCreateUserFeedbackTable);



    
    const messageInsertRoles = await insertRoles();
    console.log(messageInsertRoles);
    const messageAdminCreate = await createSuperAdmin();
    console.log(messageAdminCreate);
  } catch (err) {
    console.error('Error seeding seedPlantCare:', err);
  }
};

module.exports = seedPlantCare;
