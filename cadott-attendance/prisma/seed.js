const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  const teams = [
    {
      name: "Cadott Flag Football K-1",
      level: "Flag",
      gradeRange: "K-1",
      pin: "1001",
      seasonLabel: "2025",
    },
    {
      name: "Cadott Flag Football 2-3",
      level: "Flag",
      gradeRange: "2-3",
      pin: "1002",
      seasonLabel: "2025",
    },
    {
      name: "Cadott Flag Football 4-6",
      level: "Flag",
      gradeRange: "4-6",
      pin: "1003",
      seasonLabel: "2025",
    },
    {
      name: "Cadott CVYF 5-6",
      level: "CVYF",
      gradeRange: "5-6",
      pin: "2001",
      seasonLabel: "2025",
    },
    {
      name: "Cadott Middle School 7-8",
      level: "Middle School",
      gradeRange: "7-8",
      pin: "3001",
      seasonLabel: "2025",
    },
    {
      name: "Cadott High School 9-12",
      level: "High School",
      gradeRange: "9-12",
      pin: "4001",
      seasonLabel: "2025",
    },
  ];

  for (const team of teams) {
    const existing = await prisma.team.findFirst({
      where: { name: team.name },
      select: { id: true },
    });

    if (!existing) {
      await prisma.team.create({ data: team });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
