const pool = require('../config/db');

async function logAction({ user_id, user_email, action, entity, entity_id, details }) {
  try {
    await pool.query(
      'INSERT INTO logs (user_id, user_email, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [user_id, user_email, action, entity, entity_id, details || null]
    );
  } catch (err) {
    console.error('Erro ao registrar log:', err);
  }
}

module.exports = { logAction };