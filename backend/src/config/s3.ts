import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";

const useAwsProfile = process.env.AWS_PROFILE === "aws-practice";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "ap-southeast-2",
  ...(useAwsProfile ? { credentials: fromIni({ profile: "aws-practice" }) } : {}),
});

export default s3;