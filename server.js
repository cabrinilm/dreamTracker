import express from 'express';
import { addSleepRecord, getSleepRecords } from './app.js';

const app = express();
app.use(express.json());

// Rota para adicionar um registro
app.post('/dreamTracker', async (req, res) => {
    const { date, sleep_time, wake_time, notes } = req.body;
    try {
        await addSleepRecord(date, sleep_time, wake_time, notes);
        res.status(201).json({ message: 'Record added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding record' });
    }
});

// Rota para buscar registros
app.get('/dreamTracker', async (req, res) => {
    try {
        const records = await getSleepRecords();
        res.status(200).json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching records' });
    }
});

// Inicializar o servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

