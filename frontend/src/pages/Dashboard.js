import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [artworks, setArtworks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Visitante' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    const fetchArtworks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/artworks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setArtworks(res.data);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
        } else {
          alert('Erro ao carregar obras de arte.');
        }
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
        } else {
          alert('Erro ao carregar usuários.');
        }
      }
    };

    fetchArtworks();
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Usuário criado com sucesso!');
      setNewUser({ name: '', email: '', password: '', role: 'Visitante' });
      setShowModal(false);
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      alert('Erro ao criar usuário.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Erro ao deletar usuário.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Obras de Arte</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="artworks-list">
        {artworks.map((art) => (
          <div key={art.id} className="artwork-card">
            <h3>{art.title}</h3>
            <p>{art.description}</p>
            <span className={`status ${art.status}`}>{art.status}</span>
          </div>
        ))}
      </div>

      <h2>Usuários</h2>
      <button onClick={() => setShowModal(true)} className="open-modal-button">Criar Novo Usuário</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Novo Usuário</h3>
            <input
              placeholder="Nome"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <input
              placeholder="Senha"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="Administrador">Administrador</option>
              <option value="Curador">Curador</option>
              <option value="Artista">Artista</option>
              <option value="Visitante">Visitante</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleCreateUser}>Criar</button>
              <button onClick={() => setShowModal(false)} className="cancel-button">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <strong>{user.name}</strong> ({user.email}) - {user.role}
            <button onClick={() => handleDeleteUser(user.id)}>Deletar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;