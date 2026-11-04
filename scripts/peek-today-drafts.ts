import { prisma } from "../src/lib/prisma";

async function main() {
  const since = new Date("2026-11-04T00:00:00.000Z");
  const blogs = await prisma.blog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      readingTime: true,
      createdAt: true,
    },
  });
  const runs = await prisma.aiWriterRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      keyword: true,
      errorMessage: true,
      blogId: true,
      createdAt: true,
    },
  });
  console.log(JSON.stringify({ blogs, runs }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
