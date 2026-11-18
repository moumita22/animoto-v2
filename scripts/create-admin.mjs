import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('================================================');
  console.log('       Animoto - Admin Account Generator        ');
  console.log('================================================\n');

  let username = process.argv[2];
  let password = process.argv[3];

  if (!username) {
    username = await prompt('Enter admin username: ');
  }

  if (!username || username.length < 3) {
    console.error('❌ Error: Username must be at least 3 characters long.');
    process.exit(1);
  }

  username = username.toLowerCase();

  if (!password) {
    password = await prompt('Enter admin password (min 6 characters): ');
  }

  if (!password || password.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    const existing = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existing) {
      console.error(`\n❌ Error: Admin user "${username}" already exists. Operation cancelled.`);
      console.error(`No changes were made to the password. Please choose a different username.\n`);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.adminUser.create({
      data: {
        username,
        passwordHash,
      },
    });
    console.log(`✓ Admin user "${username}" created successfully in the database!\n`);

    console.log('You can now log in at: /admin');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
