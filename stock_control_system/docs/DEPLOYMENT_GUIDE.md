# Guia de Deploy - Sistema de Controle de Estoque

Este guia detalha como fazer o deploy do Sistema de Controle de Estoque em diferentes ambientes, desde desenvolvimento local até produção em servidores cloud.

## 📋 Pré-requisitos

### Ambiente de Desenvolvimento
- Python 3.11+
- Node.js 20+
- Git
- SQLite (incluído no Python)

### Ambiente de Produção
- Servidor Linux (Ubuntu 22.04 LTS recomendado)
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+
- Nginx
- Supervisor ou systemd
- SSL/TLS certificado

## 🔧 Deploy Local (Desenvolvimento)

### 1. Clonagem do Repositório
```bash
git clone <url-do-repositorio>
cd stock_control_system
```

### 2. Configuração do Backend
```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados
python manage.py makemigrations
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver 0.0.0.0:8000
```

### 3. Configuração do Frontend
```bash
cd frontend/stock_control_app

# Instalar dependências
pnpm install
# ou
npm install

# Iniciar servidor de desenvolvimento
pnpm run dev
# ou
npm run dev
```

### 4. Acesso à Aplicação
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

## 🚀 Deploy em Produção

### 1. Preparação do Servidor

#### Atualização do Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm postgresql postgresql-contrib nginx supervisor git
```

#### Configuração do PostgreSQL
```bash
sudo -u postgres psql

CREATE DATABASE stock_control_db;
CREATE USER stock_user WITH PASSWORD 'sua_senha_segura';
ALTER ROLE stock_user SET client_encoding TO 'utf8';
ALTER ROLE stock_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE stock_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE stock_control_db TO stock_user;
\q
```

### 2. Deploy do Backend

#### Clonagem e Configuração
```bash
cd /var/www
sudo git clone <url-do-repositorio> stock_control_system
sudo chown -R $USER:$USER /var/www/stock_control_system
cd /var/www/stock_control_system/backend

# Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

#### Configuração de Produção
Crie o arquivo `backend/stock_control_api/settings_production.py`:

```python
from .settings import *
import os

# Configurações de produção
DEBUG = False
ALLOWED_HOSTS = ['seu-dominio.com', 'www.seu-dominio.com', 'IP_DO_SERVIDOR']

# Banco de dados PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'stock_control_db',
        'USER': 'stock_user',
        'PASSWORD': 'sua_senha_segura',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Configurações de segurança
SECRET_KEY = 'sua_chave_secreta_muito_segura_aqui'
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Configurações de arquivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = '/var/www/stock_control_system/backend/staticfiles/'

# Configurações de CORS para produção
CORS_ALLOWED_ORIGINS = [
    "https://seu-dominio.com",
    "https://www.seu-dominio.com",
]

# Configurações de JWT
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/stock_control/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

#### Migrações e Coleta de Arquivos Estáticos
```bash
# Usar configurações de produção
export DJANGO_SETTINGS_MODULE=stock_control_api.settings_production

# Executar migrações
python manage.py makemigrations
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Criar diretório de logs
sudo mkdir -p /var/log/stock_control
sudo chown $USER:$USER /var/log/stock_control
```

#### Configuração do Gunicorn
Crie o arquivo `/var/www/stock_control_system/backend/gunicorn_config.py`:

```python
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
user = "www-data"
group = "www-data"
tmp_upload_dir = None
errorlog = "/var/log/stock_control/gunicorn_error.log"
accesslog = "/var/log/stock_control/gunicorn_access.log"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'
```

#### Configuração do Supervisor
Crie o arquivo `/etc/supervisor/conf.d/stock_control.conf`:

```ini
[program:stock_control]
command=/var/www/stock_control_system/backend/venv/bin/gunicorn stock_control_api.wsgi:application -c /var/www/stock_control_system/backend/gunicorn_config.py
directory=/var/www/stock_control_system/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/stock_control/supervisor.log
environment=DJANGO_SETTINGS_MODULE=stock_control_api.settings_production
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start stock_control
```

### 3. Deploy do Frontend

#### Build de Produção
```bash
cd /var/www/stock_control_system/frontend/stock_control_app

# Instalar dependências
npm install

# Configurar variáveis de ambiente
echo "VITE_API_URL=https://seu-dominio.com/api" > .env.production

# Build de produção
npm run build
```

#### Configuração do Nginx
Crie o arquivo `/etc/nginx/sites-available/stock_control`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Frontend (React)
    location / {
        root /var/www/stock_control_system/frontend/stock_control_app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache para arquivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Admin Django
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Arquivos estáticos do Django
    location /static/ {
        alias /var/www/stock_control_system/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logs
    access_log /var/log/nginx/stock_control_access.log;
    error_log /var/log/nginx/stock_control_error.log;
}
```

#### Ativação do Site
```bash
sudo ln -s /etc/nginx/sites-available/stock_control /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Configuração de SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 5. Configuração de Backup

#### Script de Backup
Crie o arquivo `/usr/local/bin/backup_stock_control.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/stock_control"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="stock_control_db"
DB_USER="stock_user"

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/stock_control_system

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

#### Agendamento com Cron
```bash
sudo chmod +x /usr/local/bin/backup_stock_control.sh
sudo crontab -e

# Adicionar linha para backup diário às 2h da manhã
0 2 * * * /usr/local/bin/backup_stock_control.sh
```

## 🐳 Deploy com Docker

### 1. Dockerfile do Backend
Crie `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Coletar arquivos estáticos
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "stock_control_api.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### 2. Dockerfile do Frontend
Crie `frontend/stock_control_app/Dockerfile`:

```dockerfile
FROM node:20-alpine as build

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código e fazer build
COPY . .
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose
Crie `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: stock_control_db
      POSTGRES_USER: stock_user
      POSTGRES_PASSWORD: sua_senha_segura
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      - DJANGO_SETTINGS_MODULE=stock_control_api.settings_production
      - DATABASE_URL=postgresql://stock_user:sua_senha_segura@db:5432/stock_control_db
    depends_on:
      - db
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend/stock_control_app
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 4. Deploy com Docker
```bash
# Build e inicialização
docker-compose up -d

# Executar migrações
docker-compose exec backend python manage.py migrate

# Criar superusuário
docker-compose exec backend python manage.py createsuperuser
```

## 🔍 Monitoramento e Logs

### 1. Configuração de Logs
```bash
# Logs do Django
tail -f /var/log/stock_control/django.log

# Logs do Gunicorn
tail -f /var/log/stock_control/gunicorn_error.log

# Logs do Nginx
tail -f /var/log/nginx/stock_control_access.log
tail -f /var/log/nginx/stock_control_error.log

# Logs do Supervisor
tail -f /var/log/stock_control/supervisor.log
```

### 2. Monitoramento de Performance
Instale e configure ferramentas de monitoramento:

```bash
# Instalar htop para monitoramento de recursos
sudo apt install htop

# Instalar PostgreSQL monitoring
sudo apt install postgresql-contrib
```

### 3. Health Checks
Crie um endpoint de health check no Django:

```python
# backend/stock_control_api/views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        # Verificar conexão com banco
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'healthy',
            'database': 'connected'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)
```

## 🔧 Manutenção

### 1. Atualizações
```bash
# Backup antes da atualização
/usr/local/bin/backup_stock_control.sh

# Atualizar código
cd /var/www/stock_control_system
git pull origin main

# Atualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Atualizar frontend
cd ../frontend/stock_control_app
npm install
npm run build

# Reiniciar serviços
sudo supervisorctl restart stock_control
sudo systemctl reload nginx
```

### 2. Troubleshooting

#### Problemas Comuns
1. **Erro 502 Bad Gateway**: Verificar se o Gunicorn está rodando
2. **Erro de CORS**: Verificar configurações de CORS no Django
3. **Erro de banco**: Verificar conexão e credenciais do PostgreSQL
4. **Arquivos estáticos não carregam**: Verificar configuração do Nginx

#### Comandos Úteis
```bash
# Status dos serviços
sudo supervisorctl status
sudo systemctl status nginx
sudo systemctl status postgresql

# Reiniciar serviços
sudo supervisorctl restart stock_control
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Verificar logs em tempo real
sudo tail -f /var/log/stock_control/*.log
```

## 📊 Performance e Otimização

### 1. Otimizações do Django
```python
# settings_production.py

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Compressão de arquivos estáticos
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'

# Otimizações de banco
DATABASES['default']['CONN_MAX_AGE'] = 60
```

### 2. Otimizações do Nginx
```nginx
# Compressão
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Cache de arquivos estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Monitoramento de Performance
```bash
# Instalar ferramentas de monitoramento
sudo apt install postgresql-contrib
sudo apt install redis-server

# Configurar Redis para cache
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

Este guia cobre os principais cenários de deploy. Para ambientes específicos ou configurações avançadas, consulte a documentação oficial das tecnologias utilizadas.

