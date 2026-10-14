import prisma from "./prisma.js";

<<<<<<< HEAD
export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log("PostgreSQL Connected");
=======
export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("PostgreSQL Connected");
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error);
        process.exit(1);
    }
>>>>>>> origin/main
}
