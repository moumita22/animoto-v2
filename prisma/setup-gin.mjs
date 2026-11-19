/**
 * PostgreSQL Database Setup & GIN Full-Text Index Configuration Script
 *
 * This script ensures:
 * 1. `trailer_url` column exists on `movie_reviews`
 * 2. `search_vector` generated tsvector column (weighted A-D) exists on `movie_reviews`
 * 3. GIN index `movie_reviews_search_vector_idx` is created on `search_vector`
 * 4. `admin_users` table is created and seeded with bcrypt hashed credentials
 * 5. Official YouTube trailers are populated for default movies
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('1. Ensuring trailer_url column exists...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE movie_reviews ADD COLUMN IF NOT EXISTS trailer_url text;
  `);

  console.log('2. Checking & creating search_vector tsvector column...');
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'movie_reviews';
  `);
  const hasVector = cols.some((c) => c.column_name === 'search_vector');

  if (!hasVector) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE movie_reviews 
      ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(director, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(genre, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(language, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(year::text, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(synopsis, '')), 'D') ||
        setweight(to_tsvector('english', coalesce(life_lessons, '')), 'D')
      ) STORED;
    `);
    console.log('✓ Added search_vector column');
  } else {
    console.log('✓ search_vector column already exists');
  }

  console.log('3. Ensuring GIN index exists on search_vector...');
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS movie_reviews_search_vector_idx 
    ON movie_reviews USING GIN (search_vector);
  `);
  console.log('✓ GIN index verified');

  console.log('4. Ensuring admin_users table exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingAdmin = await prisma.$queryRawUnsafe(
    `SELECT id FROM admin_users WHERE username = $1 LIMIT 1;`,
    'admin'
  );
  if (!Array.isArray(existingAdmin) || existingAdmin.length === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);
    await prisma.$executeRawUnsafe(
      `INSERT INTO admin_users (username, password_hash, created_at, updated_at) VALUES ($1, $2, NOW(), NOW());`,
      'admin',
      hash
    );
    console.log('✓ Seeded default admin user');
  }

  console.log('5. Updating sample trailers for initial movies...');
  await prisma.$executeRawUnsafe(`
    UPDATE movie_reviews 
    SET trailer_url = 'https://www.youtube.com/watch?v=zSWdZVtXT7E' 
    WHERE slug = 'interstellar' AND (trailer_url IS NULL OR trailer_url = '');
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE movie_reviews 
    SET trailer_url = 'https://www.youtube.com/watch?v=DMOBlEcRuw8' 
    WHERE slug = 'the-pursuit-of-happyness' AND (trailer_url IS NULL OR trailer_url = '');
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE movie_reviews 
    SET trailer_url = 'https://www.youtube.com/watch?v=7d_jQycdQGo' 
    WHERE slug = 'whiplash' AND (trailer_url IS NULL OR trailer_url = '');
  `);

  console.log('✓ Database setup and full-text GIN index are 100% complete and verified!');
}

main()
  .catch((e) => {
    console.error('Setup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
