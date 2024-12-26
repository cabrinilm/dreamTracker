import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


 // connection with database
 async function getDBConnection() {
    return open({
        filename: './banco.db',
        driver: sqlite3.Database,
    });
 }
  
// initialize database creating the table
  async function initializeDatabase() {
    const db = await getDBConnection();
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
    console.log('Database initialized');
    await db.close();
     }



      // calculate the duration of sleep

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




     // add new sleep record to the database

    async function addSleepRecord(date,sleep_time,wake_time,notes = '') {
        const db = await getDBConnection();
        const duration = calculateDuration(sleep_time, wake_time)


        await db.run(
        `INSERT INTO sleep_records(date, sleep_time, wake_time, duration, notes) VALUES (?, ?, ?, ?, ?)`, [
        date,
        sleep_time,
        wake_time,
        duration,
        notes,
    ]);


    console.log('Sleep record added successfully');
    await db.close();
}


   // retrieve all sleep records from database

   async function getSleepRecords(){
    const db = await getDBConnection();
    const records = await db.all(`SELECT * FROM sleep_records`);
    await db.close();
    return records
   }

  // find specific register 
   async  function findSpecificId(number){
    const db = await getDBConnection();
    const records = await db.all(`SELECT * FROM sleep_records`)
    await db.close(); 
    return records[number - 1] 
    
   }
   // remove any register searching by date


 
   initializeDatabase();

   export { addSleepRecord, getSleepRecords, findSpecificId}
