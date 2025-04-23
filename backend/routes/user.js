const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { logAction } = require('../utils/logger');

router.get('/', async (req, res) => {
  const users = await pool.query('SELECT id, name, email, role FROM users');
  res.json(users.rows);
});

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    await logAction({
      user_id: req.user?.id,
      user_email: req.user?.email,
      action: 'delete',
      entity: 'user',
      entity_id: userId,
      details: `Deletou usuário: ${result.rows[0].email}`
    });

    res.json({ message: 'Usuário deletado com sucesso.', user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro interno ao deletar usuário.' });
  }
});



module.exports = router;