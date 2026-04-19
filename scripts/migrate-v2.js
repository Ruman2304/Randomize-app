const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../sqlite.db');
const db = new sqlite3.Database(dbPath);

console.log('Migrating database at:', dbPath);

db.serialize(() => {
  // Add Aura to Users
  db.run(`ALTER TABLE users ADD COLUMN aura INTEGER DEFAULT 0`, (err) => {
    if (err) console.log("Column aura already exists or error:", err.message);
  });

  // Add quest_type and aura_reward to Tasks
  db.run(`ALTER TABLE tasks ADD COLUMN quest_type TEXT DEFAULT 'side'`, (err) => {
    if (err) console.log("Column quest_type already exists or error:", err.message);
  });
  
  db.run(`ALTER TABLE tasks ADD COLUMN aura_reward INTEGER DEFAULT 10`, (err) => {
    if (err) console.log("Column aura_reward already exists or error:", err.message);
  });

  // Clear existing tasks & user_tasks
  db.run(`DELETE FROM user_tasks`);
  db.run(`DELETE FROM tasks`);

  console.log('Tables updated and cleared for re-seeding.');

  // Seed New Data
  const seedTasks = [
    // --- HOME ---
    // Level 1-2
    { loc: 'home', int: 1, type: 'side', aura: 10,  desc: 'Rearrange one small area or clean a random drawer' },
    { loc: 'home', int: 2, type: 'side', aura: 10,  desc: 'Call someone you haven’t talked to in a while' },
    { loc: 'home', int: 2, type: 'main', aura: 50,  desc: 'Spend 2 hours minimum without your phone at home' },
    // Level 3
    { loc: 'home', int: 3, type: 'main', aura: 50,  desc: 'Wake up at 5 AM tomorrow or stay off social media completely for the day' },
    // Level 4
    { loc: 'home', int: 4, type: 'main', aura: 50,  desc: 'Act like a CEO: Fully redesign your daily routine and plan your next 6 months' },
    { loc: 'home', int: 4, type: 'boss', aura: 100, desc: 'Record yourself explaining an idea confidently as if giving a TED talk' },
    // Level 5
    { loc: 'home', int: 5, type: 'boss', aura: 100, desc: '48-hour digital detox challenge starting now' },
    
    // --- UNIVERSITY / SCHOOL ---
    // Level 1-2
    { loc: 'university', int: 1, type: 'side', aura: 10,  desc: 'Sit in a completely new spot in class' },
    { loc: 'university', int: 2, type: 'side', aura: 10,  desc: 'Start a conversation with a classmate you never speak to' },
    { loc: 'university', int: 2, type: 'main', aura: 50,  desc: 'Ask a thoughtful question in class voluntarily' },
    // Level 3
    { loc: 'university', int: 3, type: 'main', aura: 50,  desc: 'Introduce yourself to 3 new people today' },
    { loc: 'university', int: 3, type: 'side', aura: 10,  desc: 'Compliment 5 classmates genuinely' },
    // Level 4
    { loc: 'university', int: 4, type: 'main', aura: 50,  desc: 'Sit with a completely new group for a day' },
    { loc: 'university', int: 4, type: 'boss', aura: 100, desc: 'Give an impromptu 1-minute speech to your friends/classmates' },
    // Level 5
    { loc: 'university', int: 5, type: 'boss', aura: 100, desc: 'Start a clap at an appropriate moment (e.g. end of a presentation) enthusiastically' },
    { loc: 'university', int: 5, type: 'boss', aura: 100, desc: 'Dress sharply and act like you’re presenting something highly important all day' },

    // --- PARK / GARDEN / OUTDOOR ---
    // Level 1-2
    { loc: 'park', int: 1, type: 'side', aura: 10,  desc: 'Sit quietly for 10 minutes and observe 5 distinct details' },
    { loc: 'park', int: 2, type: 'side', aura: 10,  desc: 'Do light exercise, stretching, or jog 200 meters safely' },
    { loc: 'park', int: 2, type: 'main', aura: 50,  desc: 'Stand still and observe everything around you without phone for 15 minutes' },
    // Level 3
    { loc: 'park', int: 3, type: 'main', aura: 50,  desc: 'Meditate or reflect outdoors for 20 minutes with zero distractions' },
    { loc: 'park', int: 3, type: 'side', aura: 10,  desc: 'Start a conversation with someone else relaxing there' },
    // Level 4
    { loc: 'park', int: 4, type: 'main', aura: 50,  desc: 'Do a visible full workout outdoors confidently' },
    { loc: 'park', int: 4, type: 'boss', aura: 100, desc: 'Take a long solo walk/hike and record your thoughts out loud as a voice note' },
    // Level 5
    { loc: 'park', int: 5, type: 'boss', aura: 100, desc: 'Take a solo day trip to explore a totally new natural area locally' },

    // --- PUBLIC / STREET / ANYWHERE ---
    // Level 1-2
    { loc: 'public', int: 1, type: 'side', aura: 10,  desc: 'Walk a different route and smile at 5 strangers passing by' },
    { loc: 'public', int: 2, type: 'side', aura: 10,  desc: 'Give a compliment to a stranger respectfully' },
    { loc: 'public', int: 2, type: 'main', aura: 50,  desc: 'Walk confidently like you’re on a runway for 2 solid minutes' },
    // Level 3
    { loc: 'public', int: 3, type: 'side', aura: 10,  desc: 'Ask for directions or a recommendation from a stranger' },
    { loc: 'public', int: 3, type: 'main', aura: 50,  desc: 'Visit a nearby store or place you’ve literally never entered before' },
    // Level 4
    { loc: 'public', int: 4, type: 'main', aura: 50,  desc: 'Start 5 small conversations with strangers today' },
    { loc: 'public', int: 4, type: 'boss', aura: 100, desc: 'Sit somewhere busy, people-watch, and journal your deep thoughts for 1 hour' },
    // Level 5
    { loc: 'public', int: 5, type: 'boss', aura: 100, desc: 'Talk to 15+ strangers in one day or do something wildly expressive publicly (storytelling, etc)' },
    { loc: 'public', int: 5, type: 'boss', aura: 100, desc: 'Start a major 30-day life challenge and announce it publicly' }
  ];

  const stmt = db.prepare('INSERT INTO tasks (location, intensity, description, quest_type, aura_reward) VALUES (?, ?, ?, ?, ?)');
  seedTasks.forEach(t => {
    stmt.run(t.loc, t.int, t.desc, t.type, t.aura);
  });
  stmt.finalize();

  console.log('Database re-seeded with GTA-style Quests and Aura rewards.');
});

db.close();
