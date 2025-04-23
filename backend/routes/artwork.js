const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { logAction } = require('../utils/logger');

router.post('/', async (req, res) => {
  try {
    const { title, description, artist_id, status, image_url, location, hour, price } = req.body;

    const artwork = await pool.query(
      'INSERT INTO artworks (title, description, artist_id, status, image_url, location, hour, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, artist_id, status, image_url, location, hour, price]
    );

    await logAction({
      user_id: req.user?.id,
      user_email: req.user?.email,
      action: 'create',
      entity: 'artwork',
      entity_id: artwork.rows[0].id,
      details: `Criou obra: ${title}`
    });

    res.json(artwork.rows[0]);
  } catch (err) {
    console.error('Error in create artwork:', err);
    res.status(500).json({ message: 'Erro ao criar artwork.', err });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artworks');

    await logAction({
      user_id: req.user?.id,
      user_email: req.user?.email,
      action: 'read',
      entity: 'artwork',
      details: 'Listou todas as obras'
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error in get artworks:', err);
    res.status(500).json({ message: 'Erro ao pegar artworks.', err });
  }
});

router.put('/:id/approve', async (req, res) => {
  const artworkId = req.params.id;

  try {
    const result = await pool.query(
      'UPDATE artworks SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
      ['aprovado', artworkId, 'pendente']
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Artwork não encontrada ou já aprovada.' });
    }

    await logAction({
      user_id: req.user?.id,
      user_email: req.user?.email,
      action: 'update',
      entity: 'artwork',
      entity_id: artworkId,
      details: 'Aprovou obra'
    });

    res.json({ message: 'Artwork aprovada com sucesso.', artwork: result.rows[0] });
  } catch (err) {
    console.error('Error in approve artwork:', err);
    res.status(500).json({ message: 'Erro ao aprovar artwork.', err });
  }
});

router.put('/:id/reprove', async (req, res) => {
  const artworkId = req.params.id;

  try {
    const result = await pool.query(
      'UPDATE artworks SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
      ['recusado', artworkId, 'pendente']
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Artwork não encontrada ou já reprovada.' });
    }

    await logAction({
      user_id: req.user?.id,
      user_email: req.user?.email,
      action: 'update',
      entity: 'artwork',
      entity_id: artworkId,
      details: 'Reprovou obra'
    });

    res.json({ message: 'Artwork reprovada com sucesso.', artwork: result.rows[0] });
  } catch (err) {
    console.error('Error in reprove artwork:', err);
    res.status(500).json({ message: 'Erro ao reprovar artwork.', err });
  }
});

router.put('/:id', async (req, res) => {
  const artworkId = req.params.id;
  const { title, description, status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE artworks SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
      [title, description, status, artworkId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Artwork não encontrada.' });
    }

    await logAction({
      user_id: req.user?.id,
      user_email: req.user?.email,
      action: 'update',
      entity: 'artwork',
      entity_id: artworkId,
      details: `Atualizou obra: ${title}`
    });

    res.json({ message: 'Artwork atualizada com sucesso.', artwork: result.rows[0] });
  } catch (err) {
    console.error('Error in update artwork:', err);
    res.status(500).json({ message: 'Erro ao atualizar artwork.', err });
  }
});

module.exports = router;