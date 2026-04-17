import prisma from './src/utils/db.js';

async function main() {
  console.log('🌱 Seeding database with events and news...');

  // Create sample events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'React Workshop for Beginners',
        description: 'Learn the basics of React including components, hooks, and state management. Perfect for developers new to React!',
        category: 'workshop',
        location: 'Kigali Tech Hub',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        capacity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
        userId: 6 // John Doe
      }
    }),
    prisma.event.create({
      data: {
        title: 'Digital Marketing Conference 2026',
        description: 'Join industry leaders for a day of insights on the latest digital marketing trends, SEO, social media, and analytics.',
        category: 'conference',
        location: 'Kigali Convention Center',
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        capacity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
        userId: 7 // Jane Smith
      }
    }),
    prisma.event.create({
      data: {
        title: 'Tech Entrepreneurs Meetup',
        description: 'A casual gathering for tech entrepreneurs, startup founders, and business enthusiasts to network and share ideas.',
        category: 'meetup',
        location: 'Innovation Lab, Kigali',
        eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        capacity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
        userId: 6
      }
    }),
    prisma.event.create({
      data: {
        title: 'Local Talent Concert Night',
        description: 'Celebrate local music talent with performances from emerging artists. Food and drinks available.',
        category: 'concert',
        location: 'City Amphitheater',
        eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        capacity: 200,
        imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=300&fit=crop',
        userId: 7
      }
    })
  ]);

  console.log(`✅ Created ${events.length} events`);

  // Create sample news articles
  const news = await Promise.all([
    prisma.news.create({
      data: {
        title: 'HafiHub Marketplace Reaches 500 Active Users!',
        content: 'We are thrilled to announce that our local marketplace has reached 500 active users in just 3 months! This growth is a testament to the trust our community has placed in us.\n\nOur marketplace connects buyers and sellers locally, enabling them to trade products, services, and job opportunities. We are committed to maintaining a safe, transparent, and user-friendly platform.\n\nThank you to all our users for being part of this journey!',
        category: 'market_news',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
      }
    }),
    prisma.news.create({
      data: {
        title: '5 Tips for Successful Online Trading',
        content: 'Whether you\'re buying or selling on HafiHub, here are some tips to make your transactions smoother:\n\n1. Take Clear Photos: Good product photos increase buyer interest and lead to faster sales.\n\n2. Write Detailed Descriptions: Be honest and thorough about product condition, features, and specifications.\n\n3. Price Competitively: Research similar items to set a fair price that attracts buyers.\n\n4. Communicate Promptly: Respond to inquiries quickly and professionally.\n\n5. Meet in Safe Locations: Always meet buyers/sellers in public places during daylight hours.',
        category: 'tips',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afd651abc412?w=500&h=300&fit=crop'
      }
    }),
    prisma.news.create({
      data: {
        title: 'Tech Entrepreneurs Meetup Was a Success!',
        content: 'Last week\'s Tech Entrepreneurs Meetup brought together over 40 startup founders and business enthusiasts. The event featured inspiring talks on scaling startups, fundraising strategies, and building sustainable businesses.\n\nHighlights:\n- Keynote speech by successful entrepreneur sharing their journey\n- Panel discussion on startup challenges and solutions\n- Networking session with great food and drinks\n- Exchange of ideas and potential partnerships\n\nThanks to all who attended! Next event coming soon!',
        category: 'event_highlights',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
      }
    })
  ]);

  console.log(`✅ Created ${news.length} news articles`);

  console.log('✨ Database seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
