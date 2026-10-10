import prisma from "./prisma.js";

export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log("PostgreSQL Connected");
}
