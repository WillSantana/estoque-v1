from rest_framework import generics, status, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import date, timedelta

from .models import Product, MovimentacaoEstoque, AlertaEstoque
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    ProductListSerializer,
    DashboardStatsSerializer,
    MovimentacaoEstoqueSerializer,
    AlertaEstoqueSerializer
)
from .filters import ProductFilter


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['tipo_produto', 'marca', 'fornecedor', 'observacoes']
    ordering_fields = ['created_at', 'data_compra', 'data_validade', 'preco', 'quantidade']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


class MovimentacaoEstoqueViewSet(viewsets.ModelViewSet):
    queryset = MovimentacaoEstoque.objects.all()
    serializer_class = MovimentacaoEstoqueSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['produto', 'tipo', 'motivo', 'data']

    def get_queryset(self):
        queryset = super().get_queryset()
        data_inicio = self.request.query_params.get('data_inicio')
        data_fim = self.request.query_params.get('data_fim')
        if data_inicio and data_fim:
            queryset = queryset.filter(data__date__gte=data_inicio, data__date__lte=data_fim)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class AlertaEstoqueViewSet(viewsets.ModelViewSet):
    queryset = AlertaEstoque.objects.filter(resolvido=False)
    serializer_class = AlertaEstoqueSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        alerta = self.get_object()
        alerta.resolvido = True
        alerta.resolvido_em = timezone.now()
        alerta.save()
        return Response({'status': 'alerta resolvido'})


class RelatoriosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        produtos_baixo_estoque = Product.objects.filter(quantidade__lte=5).count()
        date_limit = timezone.now().date() + timedelta(days=30)
        produtos_proximo_vencer = Product.objects.filter(
            data_validade__lte=date_limit,
            data_validade__gte=timezone.now().date()
        ).count()
        movimentacoes_recentes = MovimentacaoEstoque.objects.filter(
            data__gte=timezone.now() - timedelta(days=30)
        ).count()
        valor_total = sum(
            produto.quantidade * produto.preco for produto in Product.objects.all()
        )

        return Response({
            'produtos_baixo_estoque': produtos_baixo_estoque,
            'produtos_proximo_vencer': produtos_proximo_vencer,
            'movimentacoes_recentes': movimentacoes_recentes,
            'valor_total_estoque': valor_total,
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_produtos = Product.objects.count()
    total_valor_estoque = Product.objects.aggregate(total=Sum('preco') * Sum('quantidade'))['total'] or 0
    produtos_vencidos = Product.objects.filter(data_validade__lt=date.today()).count()

    data_limite = date.today() + timedelta(days=30)
    produtos_proximos_vencimento = Product.objects.filter(
        data_validade__gte=date.today(),
        data_validade__lte=data_limite
    ).count()

    marcas_mais_registradas = list(
        Product.objects.values('marca').annotate(count=Count('marca')).order_by('-count')[:5]
    )
    tipos_mais_registrados = list(
        Product.objects.values('tipo_produto').annotate(count=Count('tipo_produto')).order_by('-count')[:5]
    )
    fornecedores_mais_utilizados = list(
        Product.objects.values('fornecedor').annotate(count=Count('fornecedor')).order_by('-count')[:5]
    )

    stats_data = {
        'total_produtos': total_produtos,
        'total_valor_estoque': total_valor_estoque,
        'produtos_vencidos': produtos_vencidos,
        'produtos_proximos_vencimento': produtos_proximos_vencimento,
        'marcas_mais_registradas': marcas_mais_registradas,
        'tipos_mais_registrados': tipos_mais_registrados,
        'fornecedores_mais_utilizados': fornecedores_mais_utilizados,
    }

    serializer = DashboardStatsSerializer(stats_data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def products_expiring_soon(request):
    days = request.GET.get('days', 30)
    try:
        days = int(days)
    except ValueError:
        days = 30

    data_limite = date.today() + timedelta(days=days)
    products = Product.objects.filter(
        data_validade__gte=date.today(),
        data_validade__lte=data_limite
    ).order_by('data_validade')

    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def products_expired(request):
    products = Product.objects.filter(data_validade__lt=date.today()).order_by('data_validade')
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_products(request):
    min_quantity = request.GET.get('min_quantity', 10)
    try:
        min_quantity = int(min_quantity)
    except ValueError:
        min_quantity = 10

    products = Product.objects.filter(quantidade__lte=min_quantity).order_by('quantidade')
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)
