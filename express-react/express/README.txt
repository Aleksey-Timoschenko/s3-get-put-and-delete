--- CRUD for S3 bucket
1. Create S3 bucket
2. Create IAM policy for managing S3 bucket (get, put, delete)
3. Create IAM user which will be used within our application
4. Set policy for managing S3 bucket to the created user
5. Add access key for the user
6. Use access key + secret access key for setting up s3Client
7. Use @aws-sdk/client-s3 package to get all commands you need for managing S3 bucket (get, put, delete)

--- Setting up CloudFront for S3 bucket GET method
1. Create CloudFront distribution (use S3 bucket as origin domain)
2. Use CloudFront distribution domain for generation file url (getObjectSignedUrl method in s3.js file) 

--- Setting up Signed URL for CloudFront
1. Generate private and public keys (via openssl or similar tool)
1.1 openssl genrsa -out private_key.pem 2048 
1.2 openssl rsa -pubout -in private_key.pem -out publick_key.pem
2. Create CloudFront public key
3. Create CloudFront key group with created public key
4. Attach key group to CloudFront distribution (edit distribution behavior and allow access restrictions)
5. Use @aws-sdk/cloudfront-signer package to use signed CloudFront url

--- Invalidate CloudFront cache
1. Create IAM policy for CloudFront invalidation
2. Add policy to IAM user (previously created)
3. Set up cloudFrontClient
4. Use @aws-sdk/client-cloudfront package to get invalidation command