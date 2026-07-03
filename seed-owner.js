
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("ownerpassword", 10);

  const org = await prisma.organisation.create({
    data: { name: "System" },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Product Owner",
      email: "owner@test.com",
      password: hashedPassword,
      role: "PRODUCT_OWNER",
      organizationId: org.id,
    },
  });

  console.log("Created:", owner.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());