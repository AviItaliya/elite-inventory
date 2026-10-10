import prisma from "../src/config/prisma.js";
import { Prisma } from "../src/generated/prisma/client.js";
import { categories } from "./seed/categories.js";
import { products } from "./seed/products.js";
import { suppliers } from "./seed/suppliers.js";
import { users } from "./seed/users.js";

console.log("Seed started");

async function main() {
  console.log("Users...");
  await prisma.user.createMany({
    data: await users(),
  });
  console.log("✅ Users done");

  console.log("Categories...");
  await prisma.category.createMany({
    data: categories,
  });
  console.log("✅ Categories done");

  console.log("Suppliers...");
  await prisma.supplier.createMany({
    data: suppliers,
  });
  console.log("✅ Suppliers done");

  console.log("Products...");

for (const product of products) {
  const category = await prisma.category.findUnique({
    where: {
      name: product.category,
    },
  });

  const supplier = await prisma.supplier.findFirst({
    where: {
      name: product.supplier,
    },
  });

  if (!category) {
    console.log(`❌ Category not found: ${product.category}`);
    continue;
  }

  if (!supplier) {
    console.log(`❌ Supplier not found: ${product.supplier}`);
    continue;
  }

  await prisma.product.upsert({
    where: {
      sku: product.sku,
    },
    update: {
      name: product.name,
      description: product.description,
      price: new Prisma.Decimal(product.price),
      quantity: product.quantity,
      minStock: product.minStock,
      categoryId: category.id,
      supplierId: supplier.id,
    },
    create: {
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: new Prisma.Decimal(product.price),
      quantity: product.quantity,
      minStock: product.minStock,
      categoryId: category.id,
      supplierId: supplier.id,
    },
  });
}

console.log("✅ Products done");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });