import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function createAndAddData(date, sleep_time, wake_time, notes = '') {
    const db = await open({
        filename: './banco.db',
        driver: sqlite3.Database,
    });

    await db.run(`
        CREATE TABLE IF NOT EXISTS sleep_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date DATE NOT NULL,
          sleep_time TIME NOT NULL,
          wake_time TIME NOT NULL,
          duration DECIMAL DEFAULT NULL,
          notes TEXT
        )
    `);

    function calculateDuration(sleep_time, wake_time) {
        const [sleepHour, sleepMinute] = sleep_time.split(':').map(Number);
        const [wakeHour, wakeMinute] = wake_time.split(':').map(Number);

        const sleepMinutes = sleepHour * 60 + sleepMinute;
        const wakeMinutes = wakeHour * 60 + wakeMinute;

        const durationMinutes = wakeMinutes >= sleepMinutes
            ? wakeMinutes - sleepMinutes
            : 1440 - sleepMinutes + wakeMinutes;

        return (durationMinutes / 60).toFixed(2);

        
    }

    const duration = calculateDuration(sleep_time, wake_time);

    await db.run(`INSERT INTO sleep_records(date, sleep_time, wake_time, duration, notes) VALUES (?, ?, ?, ?, ?)`, [
        date,
        sleep_time,
        wake_time,
        duration,
        notes,
    ]);

    console.log('Registered successfully');
}

createAndAddData('2024-12-24', '00:05', '07:20', 'went late');
