const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

let multerS3StorageInstance;

const AZURE_FEEDBACK_IMAGE_CONTAINER = "feedback-images";
const AZURE_PUBLICATION_CONTAINER = "publications";

const AWS_KEY = process.env.AWS_KEY;
const AWS_SECRET = process.env.AWS_SECRET;
const AWS_REGION = process.env.AWS_REGION;

function initialise() {
  aws.config.update({region: AWS_REGION, accessKeyId: AWS_KEY, secretAccessKey: AWS_SECRET});
  const s3Instance = new aws.S3();

  multerS3StorageInstance = multerS3({
    s3: s3Instance,
    bucket: "octopus-web-storage",
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now().toString()}-${file.originalname}`)
    }
  })
}

function upload() {
  return multer({
    storage: multerS3StorageInstance
  });
}

module.exports = {
  initialise,
  upload,
  AZURE_FEEDBACK_IMAGE_CONTAINER,
  AZURE_PUBLICATION_CONTAINER,
};
