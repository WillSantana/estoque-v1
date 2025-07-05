from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Importações de views
from products.views import (
    dashboard_stats,
    ExportFilterDataAPIView,
    SystemBackupAPIView,
)

def api_root(request):
    """
    Endpoint raiz da API com informações básicas.
    """
    return JsonResponse({
        'message': 'Stock Control API',
        'version': '1.0.0',
        'endpoints': {
            'authentication': '/api/auth/',
            'products': '/api/products/',
            'export_filters': '/api/export/filters/',
            'system_backup': '/api/backup/',
            'admin': '/admin/',
        }
    })


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Raiz da API
    path('api/', api_root, name='api-root'),

    # Autenticação
    path('api/auth/', include('authentication.urls')),

    # Endpoints de produtos
    path('api/products/', include('products.urls')),
    path('api/produtos/', include('products.urls')),  # Alias opcional (ex: frontend que usa esse path)

    # Filtros para exportação (endpoint separado da lógica de exportação CSV)
    path('api/export/filters/', ExportFilterDataAPIView.as_view(), name='export-filters'),

    # Backup do sistema
    path('api/backup/', SystemBackupAPIView.as_view(), name='system-backup'),
]
