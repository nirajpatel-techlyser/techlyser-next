import { PrismaClient } from "@prisma/client";
import { seedWriterPrompts } from "../prisma/seed-writer-prompts";

const prisma = new PrismaClient();

async function main() {
  await seedWriterPrompts(prisma);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
