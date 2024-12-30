require('dotenv').config();
const { createUsersTable } = require('./tables');
const { createAdminUsersTable } = require('./tables');
const { createAdminUserRolesTable } = require('./tables');
const { createContentTable } = require('./tables');
const { createCropGroup } = require('./tables');
const { createCropVariety } = require('./tables');
const { createCropCalenderTable } = require('./tables');
const { createCropCalenderDaysTable } = require('./tables');
const { createOngoingCultivationsTable } = require('./tables');
const { createXlsxHistoryTable } = require('./tables');
const { createMarketPriceTable } = require('./tables');
const { createMarketPriceServeTable } = require('./tables');
const { createOngoingCultivationsCropsTable } = require('./tables');
const { createpublicforumposts } = require('./tables');
const { createpublicforumreplies } = require('./tables');

const { createFixedAsset } = require('./tables');
const { createBuldingFixedAsset } = require('./tables');
const { createLandFixedAsset } = require('./tables');
const { createMachToolsFixedAsset } = require('./tables');
const { createMachToolsWarrantyFixedAsset } = require('./tables');
const { createOwnershipOwnerFixedAsset } = require('./tables');
const { createOwnershipLeastFixedAsset } = require('./tables');
const { createOwnershipPermitFixedAsset } = require('./tables');
const { createOwnershipSharedFixedAsset } = require('./tables');
const { createCurrentAssetRecord } = require('./tables');



const { createCurrentAssetTable } = require('./tables');
const { createSlaveCropCalenderDaysTable } = require('./tables');
const { createCropGeoTable } = require('./tables');
const { createTaskImages } = require('./tables');

const { createCompany } = require('./tables');
const { createCollectionOfficer } = require('./tables');
const { createRegisteredFarmerPayments } = require('./tables');
const { createFarmerPaymensCrops } = require('./tables');
const { createUserBankDetails } = require('./tables');
const { createCollectionCenter } = require('./tables');
const { createFarmerComplains } = require('./tables');

//Seed for market Place Application
const { createMarketPlaceUsersTable } = require('./tables');
const { createMarketPlacePackages } = require('./tables');
const { createCoupon } = require('./tables');
const { createMarketPlaceItems } = require('./tables');
const { createPackageDetails } = require('./tables');
const { createPromoItems } = require('./tables');
const { createCart } = require('./tables');
const { createCartItems } = require('./tables');
const {createMarketPriceRequestTable} = require('./tables')



const { createSalesAgentTable } = require('./tables');
const {createSalesAgentStarTable} = require('./tables')

const {createSuperAdmin} = require('./admin')
const {insertRoles} = require('./adminRoles')
const {createAgroWorld} = require('./agroworldCompany')



const { createExpiredContentCleanupEvent} = require('./events');
const {createContentPublishingEvent} = require('./events');
const {createTaskStatusEvent} = require('./events');
const {createUserActiveStatusEvent} = require('./events');



const runSeeds = async () => {
  try {
    const messageUsers = await createUsersTable();
    console.log(messageUsers);
    const messageAdminRoles = await createAdminUserRolesTable();
    console.log(messageAdminRoles);
    const messageAdmin = await createAdminUsersTable();
    console.log(messageAdmin);
    const messageInsertRoles = await insertRoles();
    console.log(messageInsertRoles);
    const messageAdminCreate = await createSuperAdmin();
    console.log(messageAdminCreate);
    const messageContentTableCreate = await createContentTable();
    console.log(messageContentTableCreate);
    const messageCreateCropGroup = await createCropGroup();
    console.log(messageCreateCropGroup);
    const messageCreateCropVariety = await createCropVariety();
    console.log(messageCreateCropVariety);
    const messageCropCallender = await createCropCalenderTable();
    console.log(messageCropCallender);
    const messageCropCallenderDays = await createCropCalenderDaysTable();
    console.log(messageCropCallenderDays);
    const messageOngoingCultivation = await createOngoingCultivationsTable();
    console.log(messageOngoingCultivation);
    createXlsxHistoryTable
    const messageXlsxHistory = await createXlsxHistoryTable();
    console.log(messageXlsxHistory);
    const messageMarketPrice = await createMarketPriceTable();
    console.log(messageMarketPrice);
    
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




    const messagecreateCollectionCenter = await createCollectionCenter();
    console.log(messagecreateCollectionCenter);



    const messageCreateCompany = await createCompany();
    console.log(messageCreateCompany);

    const messageCreateCollectionOfficer = await createCollectionOfficer();
    console.log(messageCreateCollectionOfficer);

    const messageCreateRegisteredFarmerPayments = await createRegisteredFarmerPayments();
    console.log(messageCreateRegisteredFarmerPayments);
    const messageCreateFarmerPaymensCrops = await createFarmerPaymensCrops();
    console.log(messageCreateFarmerPaymensCrops);
    const messageCreateUserBankDetails = await createUserBankDetails();
    console.log(messageCreateUserBankDetails);
    
  

    const messagecreateFarmerComplains = await createFarmerComplains();
    console.log(messagecreateFarmerComplains);

    const messageMarketPriceServeTable = await createMarketPriceServeTable();
    console.log(messageMarketPriceServeTable);


    //Seed for market Place Application
    const messageCreateMarketPlaceUsersTable = await createMarketPlaceUsersTable();
    console.log(messageCreateMarketPlaceUsersTable);
    const messageCreateMarketPlacePackages = await createMarketPlacePackages();
    console.log(messageCreateMarketPlacePackages);
    const messageCreateCoupon = await createCoupon();
    console.log(messageCreateCoupon);
    const messageCreateMarketPlaceItems = await createMarketPlaceItems();
    console.log(messageCreateMarketPlaceItems);
    const messageCreatePackageDetails = await createPackageDetails();
    console.log(messageCreatePackageDetails);
    const messageCreatePromoItems = await createPromoItems();
    console.log(messageCreatePromoItems);
    const messageCreateCart = await createCart();
    console.log(messageCreateCart);
    const messageCreateCartItems = await createCartItems();
    console.log(messageCreateCartItems);
    const messageCreateMarketPriceRequestTable = await createMarketPriceRequestTable();
    console.log(messageCreateMarketPriceRequestTable);




    const messageCreateSalesAgentTable = await createSalesAgentTable();
    console.log(messageCreateSalesAgentTable);
    const messageCreateSalesAgentStarTable = await createSalesAgentStarTable();
    console.log(messageCreateSalesAgentStarTable);


    const messagecreateExpiredContentCleanupEvent = await createExpiredContentCleanupEvent();
    console.log(messagecreateExpiredContentCleanupEvent);
    const messagecreateContentPublishingEvent = await createContentPublishingEvent();
    console.log(messagecreateContentPublishingEvent);
    const messageCreateTaskStatusEvent = await createTaskStatusEvent();
    console.log(messageCreateTaskStatusEvent);
    const messageCreateUserActiveStatusEvent = await createUserActiveStatusEvent();
    console.log(messageCreateUserActiveStatusEvent);

    const messageCreateAgroWorld = await createAgroWorld();
    console.log(messageCreateAgroWorld);

    
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

runSeeds();
