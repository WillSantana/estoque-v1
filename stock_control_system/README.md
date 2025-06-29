# Sistema de Controle de Estoque - Casa de Ração

Um sistema completo de gestão de estoque desenvolvido especificamente para lojas de ração, oferecendo controle total sobre entrada de produtos, dashboard com estatísticas em tempo real e interface moderna e responsiva.

## 🎯 Visão Geral

Este sistema foi desenvolvido para atender às necessidades específicas de casas de ração, proporcionando um controle eficiente do estoque com foco na gestão de produtos perecíveis. O sistema oferece funcionalidades essenciais como controle de validade, dashboard analítico e sistema de filtros avançados.

### Principais Características

- **Interface Moderna**: Design responsivo com tema verde, amarelo e branco
- **Autenticação Segura**: Sistema JWT para múltiplos usuários
- **Dashboard Analítico**: Estatísticas em tempo real com gráficos interativos
- **Controle de Validade**: Alertas para produtos próximos ao vencimento
- **Filtros Avançados**: Busca por qualquer campo do produto
- **Arquitetura Escalável**: Preparado para futuras expansões

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Autenticação**: JWT (JSON Web Tokens)
- **Banco de Dados**: SQLite (migração futura para PostgreSQL)
- **CORS**: django-cors-headers
- **Filtros**: django-filter

### Frontend
- **Framework**: React 18+ com Vite
- **Estilização**: TailwindCSS
- **Componentes UI**: shadcn/ui
- **Gráficos**: Recharts
- **HTTP Client**: Axios
- **Roteamento**: React Router DOM

## 📋 Funcionalidades

### Gestão de Produtos
- Cadastro completo de produtos com 9 campos essenciais
- Edição e exclusão de produtos
- Upload e gestão de imagens
- Controle de estoque em tempo real

### Dashboard Analítico
- Total de produtos em estoque
- Valor total do estoque
- Produtos vencidos e próximos ao vencimento
- Gráficos de marcas mais registradas
- Distribuição por tipos de produtos
- Ranking de fornecedores

### Sistema de Filtros
- Busca por marca, fornecedor, tipo de produto
- Filtros por data de compra e validade
- Filtros por faixa de preço
- Status de validade (válido, próximo ao vencimento, vencido)

### Autenticação e Segurança
- Sistema de login seguro com JWT
- Cadastro de novos usuários
- Sessões persistentes
- Proteção de rotas

## 🚀 Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- npm ou pnpm

### Configuração do Backend

1. **Clone o repositório e navegue para o backend**:
```bash
cd stock_control_system/backend
```

2. **Instale as dependências Python**:
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter
```

3. **Execute as migrações**:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Crie um superusuário (opcional)**:
```bash
python manage.py createsuperuser
```

5. **Inicie o servidor de desenvolvimento**:
```bash
python manage.py runserver 0.0.0.0:8000
```

### Configuração do Frontend

1. **Navegue para o frontend**:
```bash
cd stock_control_system/frontend/stock_control_app
```

2. **Instale as dependências**:
```bash
pnpm install
# ou
npm install
```

3. **Inicie o servidor de desenvolvimento**:
```bash
pnpm run dev
# ou
npm run dev
```

4. **Acesse a aplicação**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 📊 Estrutura do Projeto

```
stock_control_system/
├── backend/
│   ├── stock_control_api/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── products/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── filters.py
│   │   └── urls.py
│   ├── authentication/
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   └── manage.py
├── frontend/
│   └── stock_control_app/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── ProductList.jsx
│       │   │   ├── ProductForm.jsx
│       │   │   ├── LoginForm.jsx
│       │   │   └── Layout.jsx
│       │   ├── hooks/
│       │   │   └── useAuth.jsx
│       │   ├── lib/
│       │   │   └── api.js
│       │   └── App.jsx
│       ├── package.json
│       └── vite.config.js
└── docs/
    ├── README.md
    ├── API_DOCUMENTATION.md
    └── DEPLOYMENT_GUIDE.md
```

## 🔧 Personalização

### Modificando Campos de Produtos

Para adicionar novos campos aos produtos, edite o modelo em `backend/products/models.py`:

```python
class Produto(models.Model):
    # Campos existentes...
    novo_campo = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.marca} - {self.tipo_produto}"
```

Após modificar o modelo, execute:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Personalizando o Visual

O tema pode ser modificado em `frontend/src/App.css`. As cores principais são:

```css
:root {
  --primary: 142 69 173;    /* Verde principal */
  --secondary: 234 179 8;   /* Amarelo secundário */
  --background: 255 255 255; /* Branco de fundo */
}
```

### Adicionando Novos Gráficos

Para adicionar novos gráficos ao dashboard, edite `frontend/src/components/Dashboard.jsx` e utilize a biblioteca Recharts.

## 📱 Responsividade

O sistema foi desenvolvido com foco em responsividade, funcionando perfeitamente em:

- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com navegação otimizada
- **Mobile**: Interface touch-friendly com menu hambúrguer

## 🔒 Segurança

### Autenticação JWT
- Tokens com expiração configurável
- Refresh tokens para sessões longas
- Logout seguro com limpeza de tokens

### Proteção de Rotas
- Middleware de autenticação no backend
- Proteção de rotas no frontend
- Validação de permissões

### CORS
- Configuração adequada para desenvolvimento e produção
- Whitelist de domínios permitidos

## 📈 Escalabilidade

### Preparação para PostgreSQL

O sistema está preparado para migração do SQLite para PostgreSQL. Para fazer a migração:

1. **Instale o psycopg2**:
```bash
pip install psycopg2-binary
```

2. **Atualize as configurações em `settings.py`**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'stock_control_db',
        'USER': 'seu_usuario',
        'PASSWORD': 'sua_senha',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Módulos Futuros

A arquitetura permite a adição de novos módulos:

- **Vendas**: Sistema de PDV integrado
- **Relatórios**: Relatórios avançados em PDF
- **Fornecedores**: Gestão completa de fornecedores
- **Compras**: Sistema de pedidos automatizado
- **Integração**: APIs de pagamento (Pix, MercadoPago)

## 🧪 Testes

### Backend
```bash
python manage.py test
```

### Frontend
```bash
pnpm test
# ou
npm test
```

## 📚 Documentação Adicional

- [Documentação da API](docs/API_DOCUMENTATION.md)
- [Guia de Deploy](docs/DEPLOYMENT_GUIDE.md)
- [Guia de Contribuição](docs/CONTRIBUTING.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Manus AI** - Desenvolvimento completo do sistema

## 🆘 Suporte

Para suporte técnico ou dúvidas sobre o sistema:

1. Consulte a documentação completa
2. Verifique as issues existentes
3. Abra uma nova issue com detalhes do problema

---

**Sistema de Controle de Estoque v1.0** - Desenvolvido com ❤️ para casas de ração

