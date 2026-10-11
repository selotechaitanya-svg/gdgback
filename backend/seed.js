const mongoose = require('mongoose');
const dotenv = require('dotenv');
const QRCode = require('qrcode');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Reminder = require('./models/Reminder');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('🔄 Cleaning up existing seed collections...');

    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();
    await Reminder.deleteMany();

    console.log('🌱 Seeding Users...');
    // Create Admin User
    const adminUser = await User.create({
      name: 'GDG Lead Admin',
      email: 'admin@gdgrbu.app',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    // Create Regular Demo Users
    const demoUser = await User.create({
      name: 'Chaitanya Selote',
      email: 'chaitanya@gdgrbu.app',
      password: 'UserPassword123!',
      role: 'user',
    });

    const userTwo = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@gdgrbu.app',
      password: 'UserPassword123!',
      role: 'user',
    });

    const userThree = await User.create({
      name: 'Priya Patel',
      email: 'priya@gdgrbu.app',
      password: 'UserPassword123!',
      role: 'user',
    });

    console.log('🌱 Seeding Events...');
    const now = new Date();
    const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const eventsToCreate = [
      {
        title: 'DevFest Nagpur 2026: AI, Cloud & Web Ecosystems',
        description: 'The premier community developer festival in Central India! Join Google Developer Experts, industry leaders, and 1,000+ passionate engineers for keynotes on Gemini 2.5, Google Cloud Platform, Angular, Flutter, and Next-gen Web Architectures. Includes hands-on code labs, swags, and lunch.',
        date: addDays(14),
        venue: 'Auditorium Hall 1, Shri Ramdeobaba University, Nagpur',
        capacity: 350,
        category: 'Conference',
        createdBy: adminUser._id,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      },
      {
        title: 'Google Cloud Study Jam: Vertex AI & Gemini Masterclass',
        description: 'Dive deep into Generative AI with Google Cloud! Learn prompt engineering, function calling, multimodal embeddings, and deploying RAG pipelines on Vertex AI. Participants receive free Google Cloud Skills Boost credits and completion certificates.',
        date: addDays(7),
        venue: 'Advanced Computing Lab (Lab 4), CSE Department, RBU',
        capacity: 80,
        category: 'Bootcamp',
        createdBy: adminUser._id,
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      },
      {
        title: 'Compose Camp 2026: Modern Android with Jetpack Compose',
        description: 'Master declarative UI development on Android with Jetpack Compose, Kotlin Coroutines, and Material 3 design tokens. Build your first production-ready mobile application and publish to internal testing.',
        date: addDays(21),
        venue: 'Seminar Hall B, IT Block, RBU Campus',
        capacity: 60,
        category: 'Workshop',
        createdBy: adminUser._id,
        image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=80',
      },
      {
        title: 'Solution Challenge Hackathon: Building for UN SDGs',
        description: '36-hour sprint to solve one or more of the 17 United Nations Sustainable Development Goals using Google technologies (Firebase, Flutter, TensorFlow, Google Maps API, Google Cloud). Mentorship from GDG Leads and prize pool worth INR 50,000+!',
        date: addDays(30),
        venue: 'Incubation & Innovation Centre (IIC), RBU Nagpur',
        capacity: 120,
        category: 'Hackathon',
        createdBy: adminUser._id,
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      },
      {
        title: 'Neo-Brutalism & Modern Frontend Architecture Tech Talk',
        description: 'Explore the high-contrast aesthetic revolution taking over modern developer tools and creative web design. From raw typography and brutalist box-shadows to responsive accessibility and micro-animations with Tailwind CSS and Framer Motion.',
        date: addDays(5),
        venue: 'Virtual Stage / GDG YouTube Live & Tech Club Room',
        capacity: 200,
        category: 'Tech Talk',
        createdBy: adminUser._id,
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      },
      {
        title: 'Flutter Forward Meetup: Cross-Platform Mastery',
        description: 'A friendly community meetup dedicated to Flutter for web, desktop, and mobile. Live coding sessions, state management showdown (Riverpod vs Bloc), and networking with local mobile app developers.',
        date: addDays(18),
        venue: 'Room 204, MBA Building, RBU Campus',
        capacity: 50,
        category: 'Meetup',
        createdBy: adminUser._id,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
      },
      {
        title: 'Web Summit 2025: Retrospective & Future of Chrome',
        description: 'Past flagship event exploring WebAssembly, PWA enhancements, WebGPU graphics in browser, and next-generation CSS specifications.',
        date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // Past event
        venue: 'Main Auditorium, RBU',
        capacity: 250,
        category: 'Conference',
        createdBy: adminUser._id,
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      },
    ];

    const createdEvents = await Event.insertMany(eventsToCreate);
    console.log(`✅ Created ${createdEvents.length} events`);

    // Seed sample registrations
    console.log('🌱 Seeding Registrations & QR Codes...');
    const demoEvent1 = createdEvents[0];
    const demoEvent2 = createdEvents[1];

    const qrData1 = JSON.stringify({
      registrationId: `${demoUser._id}-${demoEvent1._id}`,
      event: demoEvent1.title,
      user: demoUser.name,
      email: demoUser.email,
      date: demoEvent1.date,
    });
    const qrCode1 = await QRCode.toDataURL(qrData1);

    await Registration.create({
      user: demoUser._id,
      event: demoEvent1._id,
      qrCode: qrCode1,
      status: 'confirmed',
    });

    const qrData2 = JSON.stringify({
      registrationId: `${demoUser._id}-${demoEvent2._id}`,
      event: demoEvent2.title,
      user: demoUser.name,
      email: demoUser.email,
      date: demoEvent2.date,
    });
    const qrCode2 = await QRCode.toDataURL(qrData2);

    await Registration.create({
      user: demoUser._id,
      event: demoEvent2._id,
      qrCode: qrCode2,
      status: 'confirmed',
    });

    // Also register other users to event 1
    await Registration.create({
      user: userTwo._id,
      event: demoEvent1._id,
      qrCode: await QRCode.toDataURL(`REG-${userTwo._id}`),
      status: 'confirmed',
    });

    await Registration.create({
      user: userThree._id,
      event: demoEvent1._id,
      qrCode: await QRCode.toDataURL(`REG-${userThree._id}`),
      status: 'confirmed',
    });

    // Update registration counts on events
    await Event.findByIdAndUpdate(demoEvent1._id, { registrationCount: 3 });
    await Event.findByIdAndUpdate(demoEvent2._id, { registrationCount: 1 });

    console.log(`
🎉 =========================================================
   Database Seeded Successfully!
   ---------------------------------------------------------
   Admin Credentials:
   Email:    admin@gdgrbu.app
   Password: AdminPassword123!
   
   Demo User Credentials:
   Email:    chaitanya@gdgrbu.app
   Password: UserPassword123!
=========================================================
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
