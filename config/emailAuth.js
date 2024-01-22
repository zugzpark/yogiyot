// AWS SES와 Nodemailer를 사용하기 위한 설정
import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';

AWS.config.update({
   accessKeyId: process.env.AWS_SES_ACCESS_KEY,
   secretAccessKey: process.env.AWS_SES_SECRET_KEY,
   region: process.env.AWS_SES_REGION,
});

const sesMailer = nodemailer.createTransport({
   SES: new AWS.SES({
      apiVersion: '2010-12-01',
   }),
});

export { sesMailer };
