const pool = require('../config/db');

const User = {
  create: async ({ name, email, passwordHash, role }) => {
    const res = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, passwordHash, role]
    );
    return res.rows[0];
  },
  findByEmail: async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }
};
module.exports = User;