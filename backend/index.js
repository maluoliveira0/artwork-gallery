import('dotenv/config');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const artworkRoutes = require('./routes/artwork');
const authMiddleware = require('./middlewares/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/artworks', authMiddleware, artworkRoutes);

app.listen(process.env.PORT || 5000, () => console.log('Server started'));