const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongoServerInstance = null;

// mongodb-memory-server caches the extracted `mongod` binary under
// `node_modules/.cache/mongodb-memory-server`, but it only looks for it relative to
// the working directory npm was launched from. When the backend is started from the
// repo root (e.g. the root `npm run dev` runner), that lookup misses and it re-downloads
// the ~780MB archive on every boot, so the API never comes up in time.
// Resolve the cached binary explicitly so startup reuses it regardless of cwd.
const resolveCachedMongoBinary = () => {
  const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache', 'mongodb-memory-server');
  try {
    // A cache can hold several versions after an upgrade, so rank them numerically
    // (string sort would rank 8.2.6 above 8.10.0) and take the newest complete file.
    const candidates = fs
      .readdirSync(cacheDir)
      .filter((f) => f.startsWith('mongod-') && !f.endsWith('.md5') && !f.endsWith('.downloading'))
      .filter((f) => {
        try {
          return fs.statSync(path.join(cacheDir, f)).size > 0;
        } catch {
          return false;
        }
      });

    if (candidates.length === 0) return null;

    const versionOf = (f) =>
      (f.match(/\d+(?:\.\d+)*/) || ['0'])[0].split('.').map((n) => parseInt(n, 10) || 0);
    const cmp = (a, b) => {
      const av = versionOf(a);
      const bv = versionOf(b);
      for (let i = 0; i < Math.max(av.length, bv.length); i += 1) {
        const d = (av[i] || 0) - (bv[i] || 0);
        if (d !== 0) return d;
      }
      return 0;
    };

    const best = candidates.sort(cmp).pop();
    return path.join(cacheDir, best);
  } catch {
    return null;
  }
};

const connectDB = async () => {
  // Reuse existing connection across serverless invocations
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri =
    process.env.MONGODB_URI ||
    'mongodb+srv://savitaselote2_db_user:6mfCvZEn9Q6VwO54@gdg.hkjz12r.mongodb.net/gdg-eventhub?retryWrites=true&w=majority&appName=GDG';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection at ${uri ? 'provided URI' : 'default'} failed: ${error.message}`);

    // In Serverless / Vercel or production environments, do NOT attempt in-memory server
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.error('❌ Skipping in-memory MongoDB in cloud/serverless environment.');
      throw error;
    }

    console.log(`🔄 Attempting to initialize fallback in-memory MongoDB...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const cachedBinary = resolveCachedMongoBinary();
      const memoryOptions = cachedBinary ? { binary: { systemBinary: cachedBinary } } : {};

      if (cachedBinary) {
        console.log(`♻️  Reusing cached in-memory MongoDB binary: ${path.basename(cachedBinary)}`);
      } else {
        console.log('📥 No cached MongoDB binary found — downloading on first run (this can take a few minutes)...');
      }

      mongoServerInstance = await MongoMemoryServer.create(memoryOptions);
      const memoryUri = mongoServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Fallback In-Memory MongoDB running and connected at: ${memoryUri}`);

      // Auto-seed in-memory database with demo GDG events & accounts
      setTimeout(async () => {
        try {
          const Event = require('../models/Event');
          const count = await Event.countDocuments();
          if (count === 0) {
            console.log('🌱 In-memory database is empty. Auto-seeding initial demo data...');
            const seed = require('../seed');
            // run seed in background without exiting
            const User = require('../models/User');
            const userCount = await User.countDocuments();
            if (userCount === 0) {
              const QRCode = require('qrcode');
              const adminUser = await User.create({
                name: 'GDG Lead Admin',
                email: 'admin@gdgrbu.app',
                password: 'AdminPassword123!',
                role: 'admin',
              });
              const demoUser = await User.create({
                name: 'Chaitanya Selote',
                email: 'chaitanya@gdgrbu.app',
                password: 'UserPassword123!',
                role: 'user',
              });
              const now = new Date();
              const addDays = (d) => new Date(now.getTime() + d * 86400000);
              const events = await Event.insertMany([
                {
                  title: 'DevFest Nagpur 2026: AI, Cloud & Web Ecosystems',
                  description: 'The premier community developer festival in Central India! Join Google Developer Experts, industry leaders, and 1,000+ passionate engineers for keynotes on Gemini 2.5, Google Cloud Platform, Angular, Flutter, and Next-gen Web Architectures.',
                  date: addDays(14),
                  venue: 'Auditorium Hall 1, Shri Ramdeobaba University, Nagpur',
                  capacity: 350,
                  category: 'Conference',
                  createdBy: adminUser._id,
                  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
                },
                {
                  title: 'Google Cloud Study Jam: Vertex AI & Gemini Masterclass',
                  description: 'Dive deep into Generative AI with Google Cloud! Learn prompt engineering, function calling, multimodal embeddings, and deploying RAG pipelines on Vertex AI.',
                  date: addDays(7),
                  venue: 'Advanced Computing Lab (Lab 4), CSE Department, RBU',
                  capacity: 80,
                  category: 'Bootcamp',
                  createdBy: adminUser._id,
                  image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
                },
                {
                  title: 'Compose Camp 2026: Modern Android with Jetpack Compose',
                  description: 'Master declarative UI development on Android with Jetpack Compose, Kotlin Coroutines, and Material 3 design tokens.',
                  date: addDays(21),
                  venue: 'Seminar Hall B, IT Block, RBU Campus',
                  capacity: 60,
                  category: 'Workshop',
                  createdBy: adminUser._id,
                  image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=80',
                },
                {
                  title: 'Solution Challenge Hackathon: Building for UN SDGs',
                  description: '36-hour sprint to solve one or more of the 17 United Nations Sustainable Development Goals using Google technologies.',
                  date: addDays(30),
                  venue: 'Incubation & Innovation Centre (IIC), RBU Nagpur',
                  capacity: 120,
                  category: 'Hackathon',
                  createdBy: adminUser._id,
                  image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
                },
                {
                  title: 'Neo-Brutalism & Modern Frontend Architecture Tech Talk',
                  description: 'Explore the high-contrast aesthetic revolution taking over modern developer tools and creative web design.',
                  date: addDays(5),
                  venue: 'Virtual Stage / GDG YouTube Live & Tech Club Room',
                  capacity: 200,
                  category: 'Tech Talk',
                  createdBy: adminUser._id,
                  image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
                },
                {
                  title: 'Flutter Forward Meetup: Cross-Platform Mastery',
                  description: 'A friendly community meetup dedicated to Flutter for web, desktop, and mobile. Live coding sessions and state management showdown.',
                  date: addDays(18),
                  venue: 'Room 204, MBA Building, RBU Campus',
                  capacity: 50,
                  category: 'Meetup',
                  createdBy: adminUser._id,
                  image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
                },
              ]);

              const Registration = require('../models/Registration');
              const qrCode = await QRCode.toDataURL(JSON.stringify({ user: demoUser.name, event: events[0].title }));
              await Registration.create({
                user: demoUser._id,
                event: events[0]._id,
                qrCode,
                status: 'confirmed',
              });
              await Event.findByIdAndUpdate(events[0]._id, { registrationCount: 1 });
              console.log('✅ In-memory database auto-seeded successfully with demo accounts & GDG events!');
            }
          }
        } catch (seedErr) {
          console.error('Auto-seed warning:', seedErr.message);
        }
      }, 500);

      return conn;
    } catch (memError) {
      console.error(`❌ Both MongoDB connection and memory fallback failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
