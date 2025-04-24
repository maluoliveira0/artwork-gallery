const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const { logAction } = require('../utils/logger');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, role });

    await logAction({
      user_id: req.user?.id,
      user_email: req.user?.email,
      action: 'create',
      entity: 'user',
      entity_id: user?.id,
      details: `Criou usuário: ${user?.email}`
    });

    res.json(user);
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET);
  
    await logAction({
      user_id: user?.id,
      user_email: user?.email,
      action: 'login',
      entity: 'user',
      entity_id: user?.id,
      details: `Logou na platafora: ${user?.email}`
    });
  
    res.json({ token });
  } catch (err) {
    console.error('Error in /login:', err);
    res.status(500).json({ message: 'Erro ao logar usuário.' });
  }
});

module.exports = router;