# galerias-de-arte

## Usuário admin default para acessos iniciais

{
  "email": "admin@gallery.com",
  "password": "123123"
}

Obs: Está no script do banco de dados a criação desse user.

A partir dele, conseguirá criar outros usuários do mesmo ou de outros perfis.

## Como rodar

### Banco de dados

1. Crie localmente uma base de dados chamada gallery
2. Pegue o script de banco em /database/schema.sql e rode dentro dessa base de dados;
3. Verifique se as tabelas e colunas foram criadas corretamente.

### Backend

1. npm install
2. node backend/index.js