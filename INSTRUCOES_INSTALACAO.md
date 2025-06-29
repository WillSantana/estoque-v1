# 🚀 Instruções de Instalação - Sistema de Controle de Estoque

## ⚡ Instalação Rápida

### 1. Extrair o Projeto
```bash
unzip sistema_controle_estoque_completo.zip
cd stock_control_system
```

### 2. Backend (Django)
```bash
cd backend

# Instalar dependências
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter

# Configurar banco de dados
python manage.py makemigrations
python manage.py migrate

# Criar usuário admin (opcional)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend (React)
```bash
cd frontend/stock_control_app

# Instalar dependências
npm install
# ou
pnpm install

# Iniciar servidor
npm run dev
# ou
pnpm run dev
```

### 4. Acessar o Sistema
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

## 📋 Pré-requisitos
- Python 3.11+
- Node.js 20+
- npm ou pnpm

## 📚 Documentação Completa
- `README.md` - Documentação principal
- `docs/API_DOCUMENTATION.md` - Documentação da API
- `docs/DEPLOYMENT_GUIDE.md` - Guia de deploy

## 🎯 Funcionalidades Principais
- ✅ Sistema de login/registro
- ✅ CRUD completo de produtos
- ✅ Dashboard com estatísticas
- ✅ Filtros avançados
- ✅ Interface responsiva
- ✅ Tema verde/amarelo/branco

## 🔧 Personalização
Consulte o `README.md` para instruções detalhadas de personalização.

---
**Sistema desenvolvido por Manus AI**

