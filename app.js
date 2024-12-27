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
          average_last_7days DECIMAL DEFAULT NULL,
          notes TEXT
        )
    `);

    
    const columns = await db.all("PRAGMA table_info(sleep_records)");
    const columnExists = columns.some(column => column.name === "average_last_7days");

    if (!columnExists) {
        await db.run(`
            ALTER TABLE sleep_records 
            ADD COLUMN average_last_7days DECIMAL DEFAULT NULL
        `);
    }

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
       async function calculateAverageSleep(sleep_time, wake_time){
        const db = await getDBConnection();
        const  table = await db.all(`SELECT duration FROM sleep_records`)
        await db.close();
          
         const lastday = Number(calculateDuration(sleep_time,wake_time))
           
         if(table.length < 6 ){
            return 'insufficient data'
         }
        const lastSixRecords  = table.slice(-6)
   
        let sleepTotal = 0;

        for(const record of lastSixRecords){
             
              sleepTotal += parseFloat(record.duration);
         
            }
          
            sleepTotal += lastday;
           

         const averageSleep = sleepTotal  / 7;
       
         return averageSleep.toFixed(2)
         
         
            
        }

        
         
    


     // add new sleep record to the database

    async function addSleepRecord(date,sleep_time,wake_time,notes = '') {
        const db = await getDBConnection();


        const duration = calculateDuration(sleep_time, wake_time);
        const average_last_7days =  await calculateAverageSleep(sleep_time, wake_time);
        const finalAverage = (average_last_7days === 'insufficient data') ? 'insufficient data' : average_last_7days;


        await db.run(
        `INSERT INTO sleep_records(date, sleep_time, wake_time, duration, average_last_7days, notes) VALUES (?, ?, ?, ?, ?, ?)`, [
        date,
        sleep_time,
        wake_time,
        duration,
        finalAverage,
        notes
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
    const records = await db.get(`SELECT * FROM sleep_records WHERE id = ?`, [number]);
    await db.close(); 
    if (number < 1 || number > records.length){
        throw new Error('ID not found')
    }
    return records[number - 1] 
    
   }
   // remove any register searching by date
   async function removeSpecificId(id) {
    const db = await getDBConnection();
    const record = await db.get(`SELECT * FROM sleep_records WHERE id = ?`, [id]);

    if (!record) {
        await db.close();
        throw new Error('ID not found');
    }

    await db.run(`DELETE FROM sleep_records WHERE id = ?`, [id]);
    await db.close();
}


    
   initializeDatabase();

   export { addSleepRecord, getSleepRecords, findSpecificId, removeSpecificId}
