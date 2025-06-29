## Esboço dos Endpoints da API RESTful

### Autenticação
- **POST /api/token/**: Obter token JWT (login)
- **POST /api/token/refresh/**: Atualizar token JWT
- **POST /api/register/**: Criar novo usuário

### Produtos
- **GET /api/products/**: Listar todos os produtos (com filtros e paginação)
- **POST /api/products/**: Criar um novo produto
- **GET /api/products/{id}/**: Obter detalhes de um produto específico
- **PUT /api/products/{id}/**: Editar um produto existente
- **DELETE /api/products/{id}/**: Excluir um produto

### Dashboard
- **GET /api/dashboard/stats/**: Obter estatísticas básicas (total de produtos, marcas mais registradas, produtos próximos do vencimento)


