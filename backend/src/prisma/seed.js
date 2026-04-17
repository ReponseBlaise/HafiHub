import prisma from '../utils/db.js';

async function main() {
  // Clear existing data (order matters for foreign keys)
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      password: 'hashed_password_here', // Will be hashed in real implementation
      location: 'Kigali'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: 'hashed_password_here',
      location: 'Gitarama'
    }
  });

  // Create test posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Need plumber for bathroom repair',
      description: 'Looking for experienced plumber to fix leaking tap',
      category: 'job',
      location: 'Kigali',
      userId: user1.id
    }
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Car broke down - mechanic needed ASAP',
      description: 'Car won\'t start, need immediate help',
      category: 'quick_job',
      location: 'Kigali',
      userId: user1.id
    }
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Used Samsung Galaxy A51',
      description: 'Excellent condition, minimal scratches',
      category: 'product',
      location: 'Gitarama',
      userId: user2.id
    }
  });

  // Create test comments
  await prisma.comment.create({
    data: {
      content: 'I can help with this! I have 10 years of plumbing experience.',
      postId: post1.id,
      userId: user2.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'What is your budget for this job?',
      postId: post1.id,
      userId: user1.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'What is the asking price?',
      postId: post3.id,
      userId: user1.id
    }
  });

  // Create test likes
  await prisma.like.create({
    data: {
      postId: post1.id,
      userId: user2.id
    }
  });

  await prisma.like.create({
    data: {
      postId: post2.id,
      userId: user2.id
    }
  });

  await prisma.like.create({
    data: {
      postId: post3.id,
      userId: user1.id
    }
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
