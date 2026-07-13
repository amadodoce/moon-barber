import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import ws from "ws";

async function main() {
  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const password = await bcrypt.hash("123456", 12);

  const admin = await prisma.user.upsert({
    where: { phone: "09000000000" },
    update: {},
    create: { phone: "09000000000", name: "مدیر سیستم", password, role: "ADMIN" },
  });

  const customer = await prisma.user.upsert({
    where: { phone: "09111111111" },
    update: {},
    create: { phone: "09111111111", name: "مشتری نمونه", password, role: "CUSTOMER" },
  });

  console.log("Seed complete!");
  console.log("Admin:", admin.phone, admin.name, admin.role);
  console.log("Customer:", customer.phone, customer.name, customer.role);
  console.log("Password for both: 123456");

  await prisma.$disconnect();
}

main();
