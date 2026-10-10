import prisma from "./prisma.js";

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("PostgreSQL Connected");
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error);
        process.exit(1);
    }
}
