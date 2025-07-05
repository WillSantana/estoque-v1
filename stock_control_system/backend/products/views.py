from rest_framework import generics, status, filters, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, F, Case, When, Value, DecimalField
from django.utils import timezone
from datetime import date, timedelta
from django.core.management import call_command
from django.http import HttpResponse

import csv
import io
import zipfile

from .models import Product, MovimentacaoEstoque, AlertaEstoque
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    ProductListSerializer,
    DashboardStatsSerializer,
    MovimentacaoEstoqueSerializer,
    AlertaEstoqueSerializer,
)
from .filters import ProductFilter


# ViewSet para MovimentacaoEstoque
class MovimentacaoEstoqueViewSet(viewsets.ModelViewSet):
    queryset = MovimentacaoEstoque.objects.all()
    serializer_class = MovimentacaoEstoqueSerializer
    permission_classes = [IsAuthenticated]


# CRUD Produtos
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


# Estatísticas do dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_produtos = Product.objects.count()
    total_unidades = Product.objects.aggregate(total=Sum('quantidade'))['total'] or 0

    total_valor_estoque = Product.objects.annotate(
        preco_safe=Case(
            When(preco__isnull=True, then=Value(0)),
            default=F('preco'),
            output_field=DecimalField(),
        ),
        quantidade_safe=Case(
            When(quantidade__isnull=True, then=Value(0)),
            default=F('quantidade'),
            output_field=DecimalField(),
        ),
    ).aggregate(
        total=Sum(F('preco_safe') * F('quantidade_safe'))
    )['total'] or 0

    produtos_vencidos = Product.objects.filter(data_validade__lt=date.today()).count()

    data_limite = date.today() + timedelta(days=30)
    produtos_proximos_vencimento = Product.objects.filter(
        data_validade__gte=date.today(),
        data_validade__lte=data_limite
    ).count()

    marcas_mais_registradas = list(
        Product.objects.values('marca').annotate(total=Count('marca')).order_by('-total')[:5]
    )

    produtos_por_tipo = list(
        Product.objects.values('tipo_produto').annotate(total=Count('tipo_produto')).order_by('-total')[:5]
    )

    produtos_recentes = Product.objects.order_by('-created_at')[:5]
    produtos_recentes_serialized = ProductListSerializer(produtos_recentes, many=True).data

    alertas = AlertaEstoque.objects.filter(resolvido=False).order_by('criado_em')[:5]
    alertas_serialized = AlertaEstoqueSerializer(alertas, many=True).data

    response_data = {
        'total_produtos': total_produtos,
        'total_unidades': total_unidades,
        'total_valor_estoque': total_valor_estoque,
        'produtos_vencidos': produtos_vencidos,
        'produtos_proximos_vencimento': produtos_proximos_vencimento,
        'marcas_mais_registradas': marcas_mais_registradas,
        'produtos_por_tipo': [
            {'name': item['tipo_produto'], 'value': item['total']}
            for item in produtos_por_tipo
        ],
        'produtos_recentes': produtos_recentes_serialized,
        'alertas_vencimento': alertas_serialized,
    }

    serializer = DashboardStatsSerializer(response_data)
    return Response(serializer.data)


# Views para produtos específicos do dashboard

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def products_expiring_soon(request):
    limite = date.today() + timedelta(days=30)
    produtos = Product.objects.filter(data_validade__gte=date.today(), data_validade__lte=limite).order_by('data_validade')
    serializer = ProductListSerializer(produtos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def products_expired(request):
    produtos = Product.objects.filter(data_validade__lt=date.today()).order_by('-data_validade')
    serializer = ProductListSerializer(produtos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_products(request):
    limite = 5  # limite para estoque baixo, pode ajustar conforme necessário
    produtos = Product.objects.filter(quantidade__lte=limite).order_by('quantidade')
    serializer = ProductListSerializer(produtos, many=True)
    return Response(serializer.data)


# Exportação CSV de produtos filtrados
class ProductExportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filterset = ProductFilter(request.GET, queryset=Product.objects.all())
        if not filterset.is_valid():
            return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

        produtos = filterset.qs
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            'ID', 'Tipo do Produto', 'Marca', 'Quantidade', 'Peso',
            'Fornecedor', 'Preço', 'Data de Compra', 'Data de Validade',
            'Valor Total', 'Criado em'
        ])
        for p in produtos:
            writer.writerow([
                p.id, p.tipo_produto, p.marca, p.quantidade, p.peso,
                p.fornecedor, p.preco, p.data_compra, p.data_validade,
                (p.quantidade or 0) * (p.preco or 0), p.created_at
            ])
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=produtos_exportados.csv'
        return response


# Backup do sistema
class SystemBackupAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            json_io = io.StringIO()
            call_command('dumpdata', stdout=json_io)
            zip_file.writestr('backup.json', json_io.getvalue())
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename=backup_sistema_{timezone.now().date()}.zip'
        return response

# Aqui você pode adicionar outras views que precise
class ExportFilterDataAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tipos = Product.objects.values_list('tipo_produto', flat=True).distinct()
        marcas = Product.objects.values_list('marca', flat=True).distinct()
        fornecedores = Product.objects.values_list('fornecedor', flat=True).distinct()

        return Response({
            'tipos_produto': list(tipos),
            'marcas': list(marcas),
            'fornecedores': list(fornecedores),
        })
