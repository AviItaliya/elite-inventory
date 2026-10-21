import "dotenv/config";
import { SESv2Client } from "@aws-sdk/client-sesv2";
import { fromIni } from "@aws-sdk/credential-providers";

const useAwsProfile = process.env.AWS_PROFILE === "aws-practice";

const ses = new SESv2Client({
    region: process.env.AWS_REGION ?? "ap-southeast-2",
    ...(useAwsProfile ? {credentials: fromIni({profile: "aws-practice"})}: {})
});

export default ses;
