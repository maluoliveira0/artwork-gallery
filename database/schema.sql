-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('Administrador', 'Curador', 'Artista', 'Visitante')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artworks table
CREATE TABLE artworks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  artist_id INTEGER REFERENCES users(id),
  status VARCHAR(50) CHECK (status IN ('pendente', 'aprovado', 'recusado')) DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE artworks
  ADD COLUMN image_url TEXT,
  ADD COLUMN location TEXT,
  ADD COLUMN hour TEXT,
  ADD COLUMN price TEXT;

-- Exhibitions table
CREATE TABLE exhibitions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artwork-Exhibition relation (many-to-many)
CREATE TABLE exhibition_artworks (
  exhibition_id INTEGER REFERENCES exhibitions(id) ON DELETE CASCADE,
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  PRIMARY KEY (exhibition_id, artwork_id)
);

-- Sales table
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  artwork_id INTEGER REFERENCES artworks(id),
  buyer_name VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_email VARCHAR(255),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT
);

-- Default admin user
INSERT INTO users (name, email, password, role)
VALUES (
  'Administrador Padrão',
  'admin@gallery.com',
  '$2b$10$Mw3keHtlfvFTvY6S.TOnNOcyt8L8nLMN2UfzBPDvKTaaKH2TiCSsi', -- senha: admin123
  'Administrador'
)
ON CONFLICT (email) DO NOTHING;



// New version (V2)

ALTER TABLE artworks ADD likes INTEGER DEFAULT 0;

-- Artwork likes tracking table
CREATE TABLE artwork_likes (
  id SERIAL PRIMARY KEY,
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artwork_id, user_id)
);