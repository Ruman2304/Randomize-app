const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../sqlite.db');
const db = new sqlite3.Database(dbPath);

console.log('Seeding new locations: mall, school, police station...');

db.serialize(() => {
  const seedTasks = [
    // --- MALL ---
    { loc: 'mall', int: 1, type: 'side', aura: 10,  desc: 'Walk an entire lap around the mall without looking at any stores.' },
    { loc: 'mall', int: 2, type: 'side', aura: 30,  desc: 'Give a genuine compliment to a retail worker.' },
    { loc: 'mall', int: 3, type: 'main', aura: 50,  desc: 'Ask a stranger where they bought an item of clothing they are holding/wearing.' },
    { loc: 'mall', int: 4, type: 'main', aura: 80,  desc: 'Walk confidently like a runway model from one end of the mall to the other.' },
    { loc: 'mall', int: 5, type: 'boss', aura: 100, desc: 'Go to the food court and start a slow clap (or just introduce yourself to 5 random shoppers warmly).' },

    // --- SCHOOL ---
    { loc: 'school', int: 1, type: 'side', aura: 10,  desc: 'Sit in a completely different spot if possible, or observe the campus silently for 5 mins.' },
    { loc: 'school', int: 2, type: 'side', aura: 30,  desc: 'Hold the door open for 5 people in a row.' },
    { loc: 'school', int: 3, type: 'main', aura: 50,  desc: 'Give a high-five or fist bump to someone you recognize but never talk to.' },
    { loc: 'school', int: 4, type: 'main', aura: 80,  desc: 'Introduce yourself confidently to a faculty member or staff you do not know.' },
    { loc: 'school', int: 5, type: 'boss', aura: 100, desc: 'Deliver an impromptu, polite 1-minute motivational speech to a group of your friends.' },

    // --- POLICE STATION (Strictly safe and respectful) ---
    { loc: 'police station', int: 1, type: 'side', aura: 10,  desc: 'Stand directly outside at a safe distance and observe the architecture for 5 minutes.' },
    { loc: 'police station', int: 2, type: 'side', aura: 30,  desc: 'Smile respectfully at an officer or staff member if you see one outside.' },
    { loc: 'police station', int: 3, type: 'main', aura: 50,  desc: 'Read every single public notice on their bulletin board outside/inside.' },
    { loc: 'police station', int: 4, type: 'main', aura: 80,  desc: 'Walk inside to the main desk and genuinely thank the dispatcher/clerk for their service, then walk out.' },
    { loc: 'police station', int: 5, type: 'boss', aura: 100, desc: 'Drop off a sealed, store-bought box of donuts/cookies at the front desk safely.' },
  ];

  const stmt = db.prepare('INSERT INTO tasks (location, intensity, description, quest_type, aura_reward) VALUES (?, ?, ?, ?, ?)');
  seedTasks.forEach(t => {
    stmt.run(t.loc, t.int, t.desc, t.type, t.aura);
  });
  stmt.finalize();

  console.log('Database successfully seeded with highly localized new tasks.');
});

db.close();
