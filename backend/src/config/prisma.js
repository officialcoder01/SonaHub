///////////////////////////////////
// Prisma configuration file
//////////////////////////////////

import "dotenv/config";
import prismaClientPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = prismaClientPkg;

const globalForPrisma = globalThis;
const connectionString =
  process.env.NODE_ENV === "test" && process.env.DATABASE_URL_TEST
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL;

const adapter = new PrismaPg(connectionString);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
