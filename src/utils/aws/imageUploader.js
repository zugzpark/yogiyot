import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import sharp from 'sharp'
import fs from 'fs/promises'

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

const imageUploader = async (file) => {
  try{
  const key = file.filename
  const params = {
    Bucket: "h99image",
    Key: key,

    //이미지 리사이징
    Body: await sharp(file.path)
      .resize(500, 500)
      .withMetadata()
      .toBuffer(),
    ContentType: file.mimetype,
    ACL: "public-read",
  };
    //AWS S3 업로드
    await s3Client.send(new PutObjectCommand(params));

     // 임시파일 삭제
     fs.access(file.path, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`파일 존재 X`);
        return;
      }
    });
    
    fs.unlink(file.path, (unlinkErr) => {
      if (unlinkErr) {
        console.error(`파일삭제 오류`);
        return;
      }
    });
  
    return key;
  } catch (error) {
    throw error;
  }
};

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

  try {
    await s3Client.send(new PutObjectCommand(params));
    return key;
  } catch (error) {
    throw error;
  }
}

export { imageUploader, uploadWebImage };
