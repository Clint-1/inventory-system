import prisma from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("Admin user created");
  } else {
    console.log("Admin already exists");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
