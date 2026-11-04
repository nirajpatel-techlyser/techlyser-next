import { prisma } from "../src/lib/prisma";

async function main() {
  const orphans = await prisma.blog.findMany({
    where: {
      slug: { contains: "shopify-theme-rebuild" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      createdAt: true,
      readingTime: true,
    },
  });
  console.log(JSON.stringify(orphans, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
