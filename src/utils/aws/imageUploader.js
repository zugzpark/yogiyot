import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import axios from 'axios'

AWS.config.update({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
});

const s3 = new AWS.S3();

const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: "h99image",
    key: (req, file, callback) => {
      const extension = path.extname(file.originalname);

      callback(null, `${Date.now()}_${extension}`);
    },
    acl: "public-read",
  }),
});

async function uploadWebImage(url, bucket, key) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const data = Buffer.from(response.data, "binary");

  const params = {
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: response.headers["content-type"],
    ContentLength: response.data.length,
    ACL: "public-read",
  };

  return s3.upload(params).promise();
}

export { imageUploader, uploadWebImage };
