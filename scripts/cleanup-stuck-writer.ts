import { prisma } from "../src/lib/prisma";
async function main() {
  const stuck = await prisma.aiWriterRun.updateMany({
    where: { status: "RUNNING", completedAt: null },
    data: {
      status: "FAILED",
      errorMessage: "Stale RUNNING run cleaned up (writer aborted / timed out)",
      completedAt: new Date(),
    },
  });
  console.log(JSON.stringify(stuck));
}
main().finally(() => prisma.$disconnect());
