import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner" -- For S3 signed url (Simple example)
import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'

import dotenv from 'dotenv'

dotenv.config()

// S3 bucket name
const bucketName = process.env.AWS_BUCKET_NAME 
// S3 bucket region
const region = process.env.AWS_BUCKET_REGION
// IAM user access key
const accessKeyId = process.env.AWS_ACCESS_KEY
// IAM user secret access key
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
// CloudFront distribution id 
const distributionId = process.env.DISTRIBUTION_ID

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

const cloudFrontClient = new CloudFrontClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})


export function uploadFile(fileBuffer, fileName, mimetype) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype
  }

  return s3Client.send(new PutObjectCommand(uploadParams));
}

export async function deleteFile(fileName) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  }

  await s3Client.send(new DeleteObjectCommand(deleteParams));

  // Invalidate the CloudFront cache for that image
  const invalidationParams = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: fileName,
      Paths: {
        Quantity: 1,
        Items: [
          "/" + fileName
        ]
      }
    }
  }
  const invalidationCommand = new CreateInvalidationCommand(invalidationParams)

  await cloudFrontClient.send(invalidationCommand)
}

export async function getObjectSignedUrl(key) {
  // Simple example 
  // const params = {
  //   Bucket: bucketName,
  //   Key: key
  // }

  // // https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
  // const command = new GetObjectCommand(params);
  // const seconds = 60
  // const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

  // With cloudFront example 
  // const url = 'https://dn21czgltllja.cloudfront.net/' + key

  // With cloudFront signed url example
  const url = getSignedUrl({
    url: 'https://dn21czgltllja.cloudfront.net/' + key, // CloudFront distribution domain + file key
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    privateKey: process.env.CLOUD_FRONT_PRIVATE_KEY, // "CONTENTS-OF-PRIVATE-KEY"
    keyPairId: process.env.CLOUD_FRONT_KEY_PAIR_ID, // "PUBLIC-KEY-ID-OF-CLOUDFRONT-KEY-PAIR"
  })

  return url
}