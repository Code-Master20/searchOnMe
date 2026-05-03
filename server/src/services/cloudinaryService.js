const crypto = require("crypto");

const categories = {
  resume: "resume",
  education: "education",
  image: "images",
  file: "files"
};

const getCloudinaryConfig = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET
  };
};

const signParams = (params, apiSecret) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
};

const createUploadSignature = (category) => {
  if (!categories[category]) {
    const error = new Error("Invalid upload category.");
    error.statusCode = 400;
    throw error;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `searchonme/${categories[category]}`;
  const signature = signParams({ folder, timestamp }, apiSecret);

  return {
    cloudName,
    apiKey,
    folder,
    resourceType: "auto",
    signature,
    timestamp
  };
};

const deleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) {
    const error = new Error("Cloudinary public id is required.");
    error.statusCode = 400;
    throw error;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const normalizedResourceType = resourceType || "image";
  const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${normalizedResourceType}/destroy`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        public_id: publicId,
        timestamp,
        api_key: apiKey,
        signature
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || "Cloudinary delete failed.");
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

module.exports = {
  createUploadSignature,
  deleteCloudinaryAsset
};
