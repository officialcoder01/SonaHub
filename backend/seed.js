import prisma from "./src/config/prisma.js";

const categories = [
  { name: "Tailoring" },
  { name: "Plumbering" },
  { name: "Electrical Work" },
  { name: "Fashion Design" },
  { name: "Interior Design" },
  { name: "Photography" },
  { name: "Videography" },
  { name: "Catering" },
  { name: "Event Planning" },
];

async function seedCategories() {
  try {
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
    }
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();