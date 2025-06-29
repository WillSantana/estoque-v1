from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductListCreateView, ProductDetailView,
    dashboard_stats, products_expiring_soon, products_expired,
    low_stock_products, MovimentacaoEstoqueViewSet
)

# Router para ViewSet de movimentações de estoque
router = DefaultRouter()
router.register(r'movimentacoes', MovimentacaoEstoqueViewSet, basename='movimentacao-estoque')

urlpatterns = [
    # CRUD de produtos
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    # Dashboard e estatísticas
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('expiring-soon/', products_expiring_soon, name='products-expiring-soon'),
    path('expired/', products_expired, name='products-expired'),
    path('low-stock/', low_stock_products, name='low-stock-products'),

    # Rotas automáticas do ViewSet (movimentações)
    path('', include(router.urls)),
]
