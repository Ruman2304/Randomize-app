const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../sqlite.db');

// Ensure database file doesn't exist so we start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

console.log('Initializing database at:', dbPath);

db.serialize(() => {
  // Create Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Create Tasks Table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      description TEXT NOT NULL
    )
  `);

  // Create User Tasks Table (completed/pending tasks)
  db.run(`
    CREATE TABLE IF NOT EXISTS user_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      video_path TEXT,
      is_public BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `);

  console.log('Tables created successfully.');

  // Seed Data
  const seedTasks = [
    // uni
    { location: 'uni', intensity: 1, description: 'Ask a random person for the time.' },
    { location: 'uni', intensity: 2, description: 'Run 200m around the campus sprint.' },
    { location: 'uni', intensity: 3, description: 'Start a slow clap in class or the library.' },
    { location: 'uni', intensity: 4, description: 'Yell "I love math!" in the middle of the quad.' },
    { location: 'uni', intensity: 5, description: 'Politely ask a professor for an autograph on your forehead.' },
    
    // park
    { location: 'park', intensity: 1, description: 'Touch grass for 10 seconds.' },
    { location: 'park', intensity: 2, description: 'Do 10 jumping jacks.' },
    { location: 'park', intensity: 3, description: 'Climb the nearest sturdy tree.' },
    { location: 'park', intensity: 4, description: 'Roll down a grassy hill.' },
    { location: 'park', intensity: 5, description: 'Sing a song out loud to the ducks or pigeons.' },

    // home
    { location: 'home', intensity: 1, description: 'Do 5 pushups right now.' },
    { location: 'home', intensity: 2, description: 'Balance a spoon on your nose.' },
    { location: 'home', intensity: 3, description: 'Take a weird selfie and send it to your best friend.' },
    { location: 'home', intensity: 4, description: 'Make a sandwich while blindfolded.' },
    { location: 'home', intensity: 5, description: 'Do a TikTok dance and upload it here.' },
    
    // gym
    { location: 'gym', intensity: 1, description: 'Stretch for 2 minutes.' },
    { location: 'gym', intensity: 2, description: 'Hold a plank for 1 minute.' },
    { location: 'gym', intensity: 3, description: 'Ask someone for a spot, then lift only the bar.' },
    { location: 'gym', intensity: 4, description: 'Do 20 burpees in the middle of the free weight section.' },
    { location: 'gym', intensity: 5, description: 'Flex in the mirror for 30 seconds while making intense eye contact with someone else.' },
  ];

  const stmt = db.prepare('INSERT INTO tasks (location, intensity, description) VALUES (?, ?, ?)');
  seedTasks.forEach(task => {
    stmt.run(task.location, task.intensity, task.description);
  });
  stmt.finalize();

  console.log('Database seeded with tasks.');
});

db.close();
