# Documentação da API - Sistema de Controle de Estoque

Esta documentação detalha todos os endpoints disponíveis na API RESTful do Sistema de Controle de Estoque, incluindo exemplos de requisições e respostas.

## Base URL

```
http://localhost:8000/api/
```

## Autenticação

A API utiliza autenticação JWT (JSON Web Tokens). Para acessar endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## Endpoints de Autenticação

### POST /auth/register/
Registra um novo usuário no sistema.

**Parâmetros:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@estoque.com",
    "first_name": "Admin",
    "last_name": "Sistema"
  }
}
```

### POST /auth/login/
Realiza login e retorna tokens JWT.

**Parâmetros:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@estoque.com",
    "first_name": "Admin",
    "last_name": "Sistema"
  }
}
```

### POST /auth/token/refresh/
Renova o token de acesso usando o refresh token.

**Parâmetros:**
```json
{
  "refresh": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Endpoints de Produtos

### GET /products/
Lista todos os produtos com suporte a filtros e paginação.

**Parâmetros de Query (opcionais):**
- `marca`: Filtrar por marca
- `tipo_produto`: Filtrar por tipo de produto
- `fornecedor`: Filtrar por fornecedor
- `data_compra_after`: Filtrar produtos comprados após esta data (YYYY-MM-DD)
- `data_compra_before`: Filtrar produtos comprados antes desta data (YYYY-MM-DD)
- `data_validade_after`: Filtrar produtos com validade após esta data (YYYY-MM-DD)
- `data_validade_before`: Filtrar produtos com validade antes desta data (YYYY-MM-DD)
- `preco_min`: Preço mínimo
- `preco_max`: Preço máximo
- `status_validade`: válido, próximo_vencimento, vencido
- `search`: Busca textual em marca, tipo_produto e fornecedor
- `page`: Número da página (padrão: 1)
- `page_size`: Itens por página (padrão: 20)

**Exemplo de Requisição:**
```
GET /api/products/?marca=Pedigree&status_validade=próximo_vencimento&page=1
```

**Resposta de Sucesso (200):**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "tipo_produto": "Ração Seca",
      "marca": "Pedigree",
      "quantidade": 50,
      "peso": "15.00",
      "fornecedor": "Distribuidora Pet",
      "preco": "89.90",
      "data_compra": "2024-01-15",
      "data_validade": "2024-07-15",
      "observacoes": "Ração para cães adultos",
      "criado_em": "2024-01-15T10:30:00Z",
      "atualizado_em": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /products/
Cria um novo produto.

**Parâmetros:**
```json
{
  "tipo_produto": "string",
  "marca": "string",
  "quantidade": "integer",
  "peso": "decimal",
  "fornecedor": "string",
  "preco": "decimal",
  "data_compra": "date (YYYY-MM-DD)",
  "data_validade": "date (YYYY-MM-DD)",
  "observacoes": "string (opcional)"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 2,
  "tipo_produto": "Ração Úmida",
  "marca": "Whiskas",
  "quantidade": 100,
  "peso": "0.85",
  "fornecedor": "Pet Shop Central",
  "preco": "3.50",
  "data_compra": "2024-01-20",
  "data_validade": "2024-12-20",
  "observacoes": "Sachê para gatos",
  "criado_em": "2024-01-20T14:15:00Z",
  "atualizado_em": "2024-01-20T14:15:00Z"
}
```

### GET /products/{id}/
Retorna detalhes de um produto específico.

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "tipo_produto": "Ração Seca",
  "marca": "Pedigree",
  "quantidade": 50,
  "peso": "15.00",
  "fornecedor": "Distribuidora Pet",
  "preco": "89.90",
  "data_compra": "2024-01-15",
  "data_validade": "2024-07-15",
  "observacoes": "Ração para cães adultos",
  "criado_em": "2024-01-15T10:30:00Z",
  "atualizado_em": "2024-01-15T10:30:00Z"
}
```

### PUT /products/{id}/
Atualiza completamente um produto.

**Parâmetros:** (todos os campos obrigatórios)
```json
{
  "tipo_produto": "string",
  "marca": "string",
  "quantidade": "integer",
  "peso": "decimal",
  "fornecedor": "string",
  "preco": "decimal",
  "data_compra": "date",
  "data_validade": "date",
  "observacoes": "string"
}
```

### PATCH /products/{id}/
Atualiza parcialmente um produto.

**Parâmetros:** (apenas campos a serem atualizados)
```json
{
  "quantidade": 75,
  "preco": "95.00"
}
```

### DELETE /products/{id}/
Remove um produto do sistema.

**Resposta de Sucesso (204):** Sem conteúdo

## Endpoints de Dashboard

### GET /dashboard/stats/
Retorna estatísticas gerais do estoque.

**Resposta de Sucesso (200):**
```json
{
  "total_produtos": 150,
  "total_valor_estoque": "15750.50",
  "produtos_vencidos": 5,
  "produtos_proximos_vencimento": 12,
  "marcas_mais_registradas": [
    {
      "marca": "Pedigree",
      "count": 25
    },
    {
      "marca": "Whiskas",
      "count": 20
    }
  ],
  "tipos_mais_registrados": [
    {
      "tipo_produto": "Ração Seca",
      "count": 80
    },
    {
      "tipo_produto": "Ração Úmida",
      "count": 45
    }
  ],
  "fornecedores_mais_utilizados": [
    {
      "fornecedor": "Distribuidora Pet",
      "count": 35
    },
    {
      "fornecedor": "Pet Shop Central",
      "count": 28
    }
  ]
}
```

### GET /products/expiring-soon/
Retorna produtos próximos ao vencimento.

**Parâmetros de Query:**
- `days`: Número de dias para considerar "próximo ao vencimento" (padrão: 30)

**Exemplo:**
```
GET /api/products/expiring-soon/?days=15
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "tipo_produto": "Ração Seca",
    "marca": "Pedigree",
    "quantidade": 50,
    "peso": "15.00",
    "fornecedor": "Distribuidora Pet",
    "preco": "89.90",
    "data_compra": "2024-01-15",
    "data_validade": "2024-07-15",
    "observacoes": "Ração para cães adultos",
    "dias_para_vencer": 10
  }
]
```

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **204 No Content**: Recurso deletado com sucesso
- **400 Bad Request**: Dados inválidos na requisição
- **401 Unauthorized**: Token de autenticação inválido ou ausente
- **403 Forbidden**: Sem permissão para acessar o recurso
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro interno do servidor

## Exemplos de Erro

### Erro de Validação (400)
```json
{
  "marca": ["Este campo é obrigatório."],
  "preco": ["Certifique-se de que este valor seja maior que 0."]
}
```

### Erro de Autenticação (401)
```json
{
  "detail": "Token inválido.",
  "code": "token_not_valid"
}
```

### Erro de Não Encontrado (404)
```json
{
  "detail": "Não encontrado."
}
```

## Filtros Avançados

### Status de Validade
O filtro `status_validade` aceita os seguintes valores:

- **válido**: Produtos com validade superior a 30 dias
- **próximo_vencimento**: Produtos que vencem nos próximos 30 dias
- **vencido**: Produtos com data de validade já ultrapassada

### Busca Textual
O parâmetro `search` realiza busca nos campos:
- marca
- tipo_produto
- fornecedor

Exemplo:
```
GET /api/products/?search=pedigree
```

### Filtros de Data
Todos os filtros de data devem usar o formato ISO (YYYY-MM-DD):

```
GET /api/products/?data_compra_after=2024-01-01&data_compra_before=2024-12-31
```

### Filtros de Preço
```
GET /api/products/?preco_min=10.00&preco_max=100.00
```

## Paginação

A API utiliza paginação baseada em offset. Parâmetros:

- `page`: Número da página (inicia em 1)
- `page_size`: Número de itens por página (máximo: 100)

Exemplo:
```
GET /api/products/?page=2&page_size=50
```

A resposta inclui metadados de paginação:
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/products/?page=3",
  "previous": "http://localhost:8000/api/products/?page=1",
  "results": [...]
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Usuários autenticados**: 1000 requisições por hora
- **Usuários anônimos**: 100 requisições por hora

Headers de resposta incluem informações sobre o limite:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Versionamento

A API utiliza versionamento via URL. A versão atual é v1:

```
http://localhost:8000/api/v1/
```

Futuras versões manterão compatibilidade com versões anteriores sempre que possível.

## Considerações de Segurança

1. **HTTPS**: Use sempre HTTPS em produção
2. **Tokens JWT**: Mantenha os tokens seguros e implemente rotação
3. **Validação**: Todos os dados são validados no servidor
4. **CORS**: Configure adequadamente para seu domínio
5. **Rate Limiting**: Monitore e ajuste conforme necessário

## Exemplos de Integração

### JavaScript (Axios)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Listar produtos
const produtos = await api.get('products/');

// Criar produto
const novoProduto = await api.post('products/', {
  tipo_produto: 'Ração Seca',
  marca: 'Royal Canin',
  quantidade: 30,
  peso: '15.00',
  fornecedor: 'Pet Center',
  preco: '120.00',
  data_compra: '2024-01-25',
  data_validade: '2024-12-25'
});
```

### Python (Requests)
```python
import requests

headers = {
    'Authorization': 'Bearer seu_token_jwt',
    'Content-Type': 'application/json'
}

# Listar produtos
response = requests.get(
    'http://localhost:8000/api/products/',
    headers=headers
)
produtos = response.json()

# Criar produto
novo_produto = {
    'tipo_produto': 'Ração Seca',
    'marca': 'Royal Canin',
    'quantidade': 30,
    'peso': '15.00',
    'fornecedor': 'Pet Center',
    'preco': '120.00',
    'data_compra': '2024-01-25',
    'data_validade': '2024-12-25'
}

response = requests.post(
    'http://localhost:8000/api/products/',
    json=novo_produto,
    headers=headers
)
```

---

Esta documentação é mantida atualizada com cada versão da API. Para dúvidas ou sugestões, consulte o repositório do projeto.

