const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**

 * @param {string}
 * @returns {Promise<void>} 
 */

const deleteFromS3 = async (s3Key) => {
  if (!s3Key) {
    console.log("No S3 key provided, skipping deletion.");
    return;
  }

  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
  };

  try {
    await s3.deleteObject(deleteParams).promise();
    console.log(`Deleted object from S3: ${s3Key}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
};

module.exports = deleteFromS3;
