from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from products.views import ProductExportAPIView, SystemBackupAPIView  # Importações novas
from products.views import dashboard_stats
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
            'export_products': '/api/products/export/',
            'system_backup': '/api/backup/',
            'admin': '/admin/',
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('authentication.urls')),
    path('api/products/', include('products.urls')),
     path('api/produtos/', include('products.urls')),  # <- CORRETO
    # Novos endpoints de exportação/backup
    path('api/products/export/', ProductExportAPIView.as_view(), name='export-products'),
    path('api/backup/', SystemBackupAPIView.as_view(), name='system-backup'),
]
