const express = require('express');
const router = express.Router();
const pool = require('../config/db');
router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC');
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      res.status(500).json({ message: 'Erro ao buscar logs.', err });
    }
  });

module.exports = router;