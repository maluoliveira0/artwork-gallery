import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [artworks, setArtworks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Visitante' });
  const [newArtwork, setNewArtwork] = useState({ title: '', description: '', image_url: '', location: '', hour: '', price: '' });
  const [showModal, setShowModal] = useState(false);
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [logs, setLogs] = useState([]);

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
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        setUserRole(payload.role);
        setUserId(payload.id);

        if (payload.role === 'Artista') {
          setArtworks(res.data.filter(a => a.artist_id === payload.id));
        } else if (payload.role === 'Visitante') {
          setArtworks(res.data.filter(a => a.status === 'aprovado'));
        } else {
          setArtworks(res.data);
        }
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
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  };

  const handleCreateArtwork = async () => {
    try {
      await axios.post('http://localhost:5000/api/artworks', {
        ...newArtwork,
        artist_id: userId,
        status: 'pendente'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Obra criada com sucesso!');
      setShowArtworkModal(false);
      setNewArtwork({ title: '', description: '', image_url: '', location: '', hour: '', price: '' });
      window.location.reload();
    } catch (err) {
      alert('Erro ao criar obra.');
    }
  };

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

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/artworks/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updated = await axios.get('http://localhost:5000/api/artworks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setArtworks(updated.data);
      alert('Obra aprovada com sucesso!');
    } catch (err) {
      alert('Erro ao aprovar obra.');
    }
  };

  const handleReprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/artworks/${id}/reprove`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const updated = await axios.get('http://localhost:5000/api/artworks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setArtworks(updated.data);
      alert('Obra reprovada com sucesso!');
    } catch (err) {
      alert('Erro ao reprovar obra.');
    }
  };


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Obras de Arte</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>

      {userRole === 'Artista' && (
        <button onClick={() => setShowArtworkModal(true)} className="open-modal-button">
          Nova Obra
        </button>
      )}

      {showArtworkModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nova Obra</h3>
            <input placeholder="Título" value={newArtwork.title} onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })} />
            <input placeholder="Descrição" value={newArtwork.description} onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })} />
            <input placeholder="URL da Imagem" value={newArtwork.image_url} onChange={(e) => setNewArtwork({ ...newArtwork, image_url: e.target.value })} />
            <input placeholder="Localização Completa" value={newArtwork.location} onChange={(e) => setNewArtwork({ ...newArtwork, location: e.target.value })} />
            <input placeholder="Horário da Exposição" value={newArtwork.hour} onChange={(e) => setNewArtwork({ ...newArtwork, hour: e.target.value })} />
            <input placeholder="Preço" value={newArtwork.price} onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })} />
            <div className="modal-actions">
              <button onClick={handleCreateArtwork}>Criar</button>
              <button onClick={() => setShowArtworkModal(false)} className="cancel-button">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="artworks-list">
        {artworks.map((art) => (
          <div key={art.id} className="artwork-card">
            {art.image_url && <img src={art.image_url} alt={art.title} style={{ width: '100%', borderRadius: '8px' }} />}
            <h3>{art.title}</h3>
            <p>{art.description}</p>
            {art.location && <p><strong>Local:</strong> {art.location}</p>}
            {art.hour && <p><strong>Horário:</strong> {art.hour}</p>}
            {art.price && <p><strong>Preço:</strong> R$ {art.price}</p>}
            {(userRole !== 'Visitante') && (<span className={`status ${art.status}`}>{art.status}</span>)}
            {(userRole === 'Curador') && art.status === 'pendente' && (
              <div className="artwork-actions" style={{ marginTop: '25px', display: 'flex', gap: '8px' }}>
                <button onClick={() => handleApprove(art.id)} className="approve-button">Aprovar ✔</button>
                <button onClick={() => handleReprove(art.id)} className="reprove-button">Reprovar ✖</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {(userRole === 'Administrador') && <>
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

          <br></br>
        <h2>Auditoria - Relatório de Logs</h2>
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className="log-entry">
                <p><strong>{log.timestamp}</strong> - <em>{log.user_email || ''}</em> realizou <strong>{log.action.toUpperCase()}</strong> em <strong>{log.entity}</strong> (ID: {log.entity_id || '-'})</p>
                {log.details && <p>{log.details}</p>}
                <hr />
              </div>
            ))}
          </div>
      </>}
    </div>
  );
}

export default Dashboard;