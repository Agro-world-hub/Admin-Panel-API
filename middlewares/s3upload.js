const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Uploads a file to S3 and returns the file URL.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} fileName - The original file name.
 * @param {string} keyPrefix - The prefix path (folder structure) in the S3 bucket.
 * @returns {Promise<string>} - Resolves with the file URL after successful upload.
 */
const uploadFileToS3 = async (fileBuffer, fileName, keyPrefix) => {
  try {
    const fileExtension = fileName.split(".").pop(); // Get file extension
    const uniqueFileName = `${uuidv4()}.${fileExtension}`; // Generate a unique file name
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${keyPrefix}/${uniqueFileName}`, // Full path in the bucket
      Body: fileBuffer,
      ContentType: `image/${fileExtension}`, // Assuming an image, adjust if needed
      ACL: "public-read", // File visibility
    };

    const result = await s3.upload(s3Params).promise();
    return result.Location; // Return the file URL
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

module.exports =  uploadFileToS3 ;
