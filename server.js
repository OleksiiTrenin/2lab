const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.')); 

app.get('/results.json', (req, res) => {
    const filePath = path.join(__dirname, 'results.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.json([]);
        res.json(JSON.parse(data));
    });
});

app.post('/save-results', (req, res) => {
    const filePath = path.join(__dirname, 'results.json');
    const results = req.body;
    fs.writeFile(filePath, JSON.stringify(results, null, 2), (err) => {
        if (err) {
            console.error('Помилка запису:', err);
            return res.status(500).send('Помилка збереження');
        }
        res.send('Результати збережено');
    });
});

app.listen(3000, () => {
    console.log('Сервер запущено на http://localhost:3000');
});