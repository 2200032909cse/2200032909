const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

const WINDOW_SIZE = 10;
const VALID_IDS = new Set(['p', 'f', 'e', 'r']);

let storedNumbers = [];
let storedSet = new Set();

const THIRD_PARTY_API_BASE = 'http://20.244.56.144/numbers/';

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid.toLowerCase();

  if (!VALID_IDS.has(numberid)) {
    return res.status(400).json({ error: 'Invalid numberid' });
  }

  const prevState = [...storedNumbers];

  try {
    const response = await axios.get(`${THIRD_PARTY_API_BASE}${numberid}`, { timeout: 500 });
    let fetchedNumbers = response.data.numbers || response.data;

    if (!Array.isArray(fetchedNumbers)) {
      fetchedNumbers = [];
    }

    for (const num of fetchedNumbers) {
      if (!storedSet.has(num)) {
        if (storedNumbers.length === WINDOW_SIZE) {
          const oldest = storedNumbers.shift();
          storedSet.delete(oldest);
        }
        storedNumbers.push(num);
        storedSet.add(num);
      }
    }
  } catch (error) {
    return res.json({
      windowPrevState: prevState,
      windowCurrState: prevState,
      numbers: prevState,
      avg: prevState.length ? (prevState.reduce((a,b) => a+b,0) / prevState.length).toFixed(2) : 0.00
    });
  }

  const currState = [...storedNumbers];
  const avg = currState.length ? (currState.reduce((a,b) => a+b, 0) / currState.length).toFixed(2) : 0.00;

  res.json({
    windowPrevState: prevState,
    windowCurrState: currState,
    numbers: currState,
    avg: Number(avg)
  });
});

app.listen(PORT, () => {
  console.log(`Average Calculator microservice running at http://localhost:${PORT}`);
});
