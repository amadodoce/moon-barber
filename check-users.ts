import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

async function main() {
  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({
    select: { phone: true, name: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  console.log("Total users:", users.length);
  console.log("");
  users.forEach((u) => {
    console.log(`Phone: ${u.phone} | Name: ${u.name} | Role: ${u.role}`);
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
