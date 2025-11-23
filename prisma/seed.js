const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const badges = [
    {
      code: 'FIRST_BOOK',
      name: 'Premier Livre',
      description: 'Bravo ! Vous avez ajouté votre premier livre à la bibliothèque.',
      category: 'COLLECTION',
      iconUrl: 'book-open'
    },
    {
      code: '100_PAGES',
      name: '100 Pages Lues',
      description: 'Vous avez lu 100 pages cumulées.',
      category: 'READING',
      iconUrl: 'eyeglasses'
    },
    {
      code: 'BOOKWORM',
      name: 'Rat de Bibliothèque',
      description: 'Vous avez lu 5 livres.',
      category: 'READING',
      iconUrl: 'library'
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {},
      create: badge,
    });
  }

  console.log('Badges seeded!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
