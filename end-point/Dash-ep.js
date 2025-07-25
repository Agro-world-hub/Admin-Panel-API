const DashDao = require("../dao/Dash-dao");
const ValidateSchema = require("../validations/SalesAgentDash-validation");

const fs = require("fs");
const xlsx = require("xlsx");
const collectionofficerDao = require("../dao/CollectionOfficer-dao");

const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");
const uploadFileToS3 = require("../middlewares/s3upload");
const deleteFromS3 = require("../middlewares/s3delete");

exports.getAllCustomers = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    const { page, limit, searchText } = await ValidateSchema.getAllSalesAgentsSchema.validateAsync(req.query);
    console.log(page, limit, searchText);


    const { items, total } = await DashDao.getAllSalesCustomers(page, limit, searchText);

    console.log("Successfully fetched customers");
    res.json({ items, total });
  } catch (err) {
    if (err.isJoi) {
      console.error("Validation error:", err.details[0].message);
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "An error occurred while fetching customers" });
  }
};


exports.getAllSalesAgents = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    // Validate query parameters
    // const validatedQuery =
    //   await collectionofficerValidate.getAllCollectionOfficersSchema.validateAsync(
    //     req.query
    //   );

    const { page, limit, searchText, status } = req.query;

    // const { page, limit, nic, company } = validatedQuery;

    // Call the DAO to get all collection officers
    const result = await DashDao.getAllSalesAgents(
      page,
      limit,
      searchText,
      status
    );

    console.log({ page, limit });
    return res.status(200).json(result);
  } catch (error) {
    // if (error.isJoi) {
    //   // Handle validation error
    //   return res.status(400).json({ error: error.details[0].message });
    // }

    console.error("Error fetching collection officers:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" });
  }
};

exports.deleteSalesAgent = async (req, res) => {
  try {
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);

    // Validate the request parameters
    const { id } =
      await ValidateSchema.deleteSalesAgentSchema.validateAsync(
        req.params
      );

    const affectedRows = await DashDao.deleteSalesAgent(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "company head not found" });
    } else {
      console.log("company head deleted successfully");
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    if (err.isJoi) {
      // Validation error
      return res.status(400).json({ error: err.details[0].message });
    }

    console.error("Error deleting company head:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting company head" });
  }
};

exports.getForCreateId = async (req, res) => {
  try {

    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    console.log("Request URL:", fullUrl);
    // const { role } = await ValidateSchema.getRoleShema.validateAsync(
    //   req.params
    // );

    const role = 'SA';

    const results = await DashDao.getForCreateId(role);

    if (results.length === 0) {
      return res.json({ result: { empId: "00001" }, status: true });
    }

    res.status(200).json({ result: results[0], status: true });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.createSalesAgent = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);

  try {
    const officerData = JSON.parse(req.body.officerData);

    console.log(officerData);

    const isExistingPhone1 = await DashDao.checkPhoneExist(
      officerData.phoneNumber1
    );
    if (isExistingPhone1) {
      return res.status(400).json({
        error: "Phone number 01 already exists",
      });
    }


    const isExistingPhone2 = await DashDao.checkPhoneExist(
      officerData.phoneNumber2
    );
    if (isExistingPhone2) {
      return res.status(400).json({
        error: "Phone number 02 already exists",
      });
    }


    const isExistingNIC = await DashDao.checkNICExist(
      officerData.nic
    );
    if (isExistingNIC) {
      return res.status(400).json({
        error: "NIC already exists",
      });
    }


    const isExistingEmail = await DashDao.checkEmailExist(
      officerData.email
    );
    if (isExistingEmail) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }
    

  

    let profileImageUrl = null; // Default to null if no image is provided

    // Check if an image file is provided
    if (req.body.file) {
      try {
        const base64String = req.body.file.split(",")[1]; // Extract the Base64 content
        const mimeType = req.body.file.match(/data:(.*?);base64,/)[1]; // Extract MIME type
        const fileBuffer = Buffer.from(base64String, "base64"); // Decode Base64 to buffer



        const fileExtension = mimeType.split("/")[1]; // Extract file extension from MIME type
        const fileName = `${officerData.firstName}_${officerData.lastName}.${fileExtension}`;

        // Upload image to S3

        console.log('go to s3');
        profileImageUrl = await uploadFileToS3(
          fileBuffer,
          fileName,
          "salesagent/image"
        );
      } catch (err) {
        console.error("Error processing image file:", err);
        return res
          .status(400)
          .json({ error: "Invalid file format or file upload error" });
      }
    }


      if (req.body.file) {
      const fileBuffer = req.body.file.buffer;
      const fileName = req.body.file.originalname;

      profileImageUrl = await uploadFileToS3(
        fileBuffer,
        fileName,
        "users/profile-images"
      );
    }
    const newSalseAgentId = await DashDao.genarateNewSalesAgentIdDao()
    console.log("newSalseAgentId:",newSalseAgentId);
    
    // Save officer data (without image if no image is uploaded)
    console.log('got to dao', profileImageUrl);
    const resultsPersonal =
      await DashDao.createSalesAgent(
        officerData,
        profileImageUrl,
        newSalseAgentId
      );

    console.log("Center Head created successfully");
    return res.status(201).json({
      message: "Center Head created successfully",
      id: resultsPersonal.insertId,
      status: false,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }

    console.error("Error creating Center Head:", error);
    return res.status(500).json({
      error: "An error occurred while creating the Center Head",
    });
  }
};

exports.getSalesAgentDataById = async (req, res) => {
  try {
    const id = req.params.id;
    const officerData = await DashDao.getSalesAgentDataById(id);

    if (!officerData) {
      return res.status(404).json({ error: "Collection Officer not found" });
    }

    console.log(
      "Successfully fetched collection officer, company, and bank details"
    );
    res.json({ officerData });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ error: err.details[0].message });
    }
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};


exports.updateSalesAgentDetails = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);
  const { id } = req.params;

  const officerData = JSON.parse(req.body.officerData);
  // const qrCode = await collectionofficerDao.getQrImage(id);
  // const officerDataForImage = await DashDao.getSalesAgentDataById(id);
  console.log(officerData);

  const isExistingPhone1 = await DashDao.checkPhoneExistSaEdit(
    officerData.phoneNumber1, id
  );

  const isExistingPhone2 = await DashDao.checkPhoneExistSaEdit(
    officerData.phoneNumber2, id
  );

  const isExistingNIC = await DashDao.checkNICExistSaEdit(
    officerData.nic, id
  );
  const isExistingEmail = await DashDao.checkEmailExistSaEdit(
    officerData.email, id
  );

  if (isExistingNIC) {
    return res.status(500).json({
      error: "NIC already exists",
    });
  }

  if (isExistingEmail) {
    return res.status(500).json({
      error: "Email already exists",
    });
  }

  if (isExistingPhone1) {
    return res.status(500).json({
      error: "Phone number 01 already exists",
    });
  }

  if (isExistingPhone2) {
    return res.status(500).json({
      error: "Phone number 02 already exists",
    });
  }


  // let qrImageUrl;

  if (req.body.file) {
    await deleteFromS3(officerData.image);
    console.log(req.body.file);


    const base64String = req.body.file.split(",")[1]; // Extract the Base64 content
    const mimeType = req.body.file.match(/data:(.*?);base64,/)[1]; // Extract MIME type
    const fileBuffer = Buffer.from(base64String, "base64"); // Decode Base64 to buffer

    const fileExtension = mimeType.split("/")[1]; // Extract file extension from MIME type
    const fileName = `${officerData.firstName}_${officerData.lastName}.${fileExtension}`;

    officerData.image = await uploadFileToS3(
      fileBuffer,
      fileName,
      "salesagent/image"
    );
  }

  const {

    firstName,
    lastName,
    empId,
    empType,
    phoneCode1,
    phoneNumber1,
    phoneCode2,
    phoneNumber2,
    nic,
    email,
    houseNumber,
    streetName,
    city,
    district,
    province,
    country,
    accHolderName,
    accNumber,
    bankName,
    branchName,
    image
  } = officerData;
  console.log(empId);

  try {
    await DashDao.updateSalesAgentDetails(
      id,

      firstName,
      lastName,
      empId,
      empType,
      phoneCode1,
      phoneNumber1,
      phoneCode2,
      phoneNumber2,
      nic,
      email,
      houseNumber,
      streetName,
      city,
      district,
      province,
      country,
      accHolderName,
      accNumber,
      bankName,
      branchName,
      image
    );
    res.json({ message: "Collection officer details updated successfully" });
  } catch (err) {
    console.error("Error updating collection officer details:", err);
    res
      .status(500)
      .json({ error: "Failed to update collection officer details" });
  }
};

exports.UpdateStatusAndSendPassword = async (req, res) => {
  try {
    const { id, status } = req.params;

    // Validate input
    if (!id || !status) {
      return res
        .status(400)
        .json({ message: "ID and status are required.", status: false });
    }

    // Fetch officer details by ID
    const officerData = await DashDao.getSalesAgentEmailDao(
      id
    );
    if (!officerData) {
      return res
        .status(404)
        .json({ message: "Collection officer not found.", status: false });
    }

    // Destructure email, firstNameEnglish, and empId from fetched data
    const { email, firstName, empId } = officerData;
    console.log(`Email: ${email}, Name: ${firstName}, Emp ID: ${empId}`);

    // Generate a new random password
    const generatedPassword = Math.random().toString(36).slice(-8); // Example: 8-character random password

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Update status and password in the database
    const updateResult =
      await DashDao.UpdateSalesAgentStatusAndPasswordDao({
        id,
        status,
        password: hashedPassword,
      });

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({
        message: "Failed to update status and password.",
        status: false,
      });
    }

    // If status is 'Approved', send the password email
    if (status === "Approved") {
      const emailResult = await DashDao.SendGeneratedPasswordDao(
        email,
        generatedPassword,
        empId,
        firstName
      );

      if (!emailResult.success) {
        return res.status(500).json({
          message: "Failed to send password email.",
          error: emailResult.error,
        });
      }

      const newTarget = await DashDao.createSalesTarget(id);
      
    }

    // Return success response with empId and email
    res.status(200).json({
      message: "Status updated and password sent successfully.",
      status: true,
      data: {
        empId, // Include empId for reference
        email, // Include the email sent to
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred.", error });
  }
};

exports.getAllOrders = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  console.log(fullUrl);


  try {
    const { page, limit, orderStatus, paymentMethod, paymentStatus, deliveryType, searchText, date } = req.query;


    // Call the DAO to get all collection officers
    const result = await DashDao.getAllOrders(
      page,
      limit,
      orderStatus,
      paymentMethod,
      paymentStatus,
      deliveryType,
      searchText,
      date

    );

    // console.log({ page, limit });
    console.log('result', result);

    return res.status(200).json(result);
  } catch (error) {
    // if (error.isJoi) {
    //   // Handle validation error
    //   return res.status(400).json({ error: error.details[0].message });
    // }

    console.error("Error fetching collection officers:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching collection officers" });
  }
};

exports.getDashUserOrders = async (req, res) => {
  try {

    const userId = req.params.userId;
    const statusFilter = req.query.status || "Ordered";

    const userOrders = await DashDao.getUserOrdersDao(
      parseInt(userId),
      statusFilter
    );

    if (!userOrders || userOrders.length === 0) {
      return res.json({
        success: false,
        message: `No ${statusFilter.toLowerCase()} orders found for this user`,
        statusFilter: statusFilter,
      });
    }

    // Group orders by schedule type
    const ordersByScheduleType = userOrders.reduce((acc, order) => {
      const scheduleType = order.sheduleType || "unscheduled"; // Handle possible undefined
      if (!acc[scheduleType]) {
        acc[scheduleType] = [];
      }
      acc[scheduleType].push(order);
      return acc;
    }, {});

    // Format response data
    const responseData = {
      success: true,
      data: {
        orders: userOrders,
        ordersByScheduleType,
        count: userOrders.length,
        statusFilter: statusFilter,
      },
      metadata: {
        userId: userId,
        orderStatus: statusFilter,
        retrievedAt: new Date().toISOString(),
      },
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error fetching user orders:", err);

    // Enhanced error handling
    let statusCode = 500;
    let message = "An error occurred while fetching user orders.";

    if (err.isJoi) {
      statusCode = 400;
      message = err.details[0].message;
    } else if (
      err.code === "ER_NO_SUCH_TABLE" ||
      err.code === "ER_BAD_FIELD_ERROR"
    ) {
      statusCode = 500;
      message = "Database configuration error";
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      statusCode = 503;
      message = "Database service unavailable";
    }

    const errorResponse = {
      success: false,
      message: message,
      ...(process.env.NODE_ENV === "development" && {
        error: err.stack,
        details: err.message,
      }),
    };

    res.status(statusCode).json(errorResponse);
  }
};