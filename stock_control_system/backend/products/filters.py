import django_filters
from django.db import models
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """
    Filtros personalizados para o modelo Product.
    """
    # Filtros de texto
    tipo_produto = django_filters.CharFilter(lookup_expr='icontains')
    marca = django_filters.CharFilter(lookup_expr='icontains')
    fornecedor = django_filters.CharFilter(lookup_expr='icontains')
    
    # Filtros de data
    data_compra_inicio = django_filters.DateFilter(field_name='data_compra', lookup_expr='gte')
    data_compra_fim = django_filters.DateFilter(field_name='data_compra', lookup_expr='lte')
    data_validade_inicio = django_filters.DateFilter(field_name='data_validade', lookup_expr='gte')
    data_validade_fim = django_filters.DateFilter(field_name='data_validade', lookup_expr='lte')
    
    # Filtros de valor
    preco_min = django_filters.NumberFilter(field_name='preco', lookup_expr='gte')
    preco_max = django_filters.NumberFilter(field_name='preco', lookup_expr='lte')
    quantidade_min = django_filters.NumberFilter(field_name='quantidade', lookup_expr='gte')
    quantidade_max = django_filters.NumberFilter(field_name='quantidade', lookup_expr='lte')
    peso_min = django_filters.NumberFilter(field_name='peso', lookup_expr='gte')
    peso_max = django_filters.NumberFilter(field_name='peso', lookup_expr='lte')
    
    # Filtro de status de validade
    status_validade = django_filters.ChoiceFilter(
        choices=[
            ('vencido', 'Vencido'),
            ('proximo_vencimento', 'Próximo ao vencimento'),
            ('atencao', 'Atenção'),
            ('ok', 'OK'),
        ],
        method='filter_by_status_validade'
    )
    
    # Filtro de busca geral
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Product
        fields = {
            'tipo_produto': ['exact', 'icontains'],
            'marca': ['exact', 'icontains'],
            'fornecedor': ['exact', 'icontains'],
            'data_compra': ['exact', 'gte', 'lte'],
            'data_validade': ['exact', 'gte', 'lte'],
            'preco': ['exact', 'gte', 'lte'],
            'quantidade': ['exact', 'gte', 'lte'],
            'peso': ['exact', 'gte', 'lte'],
        }

    def filter_by_status_validade(self, queryset, name, value):
        """
        Filtra produtos por status de validade.
        """
        from datetime import date
        
        today = date.today()
        
        if value == 'vencido':
            return queryset.filter(data_validade__lt=today)
        elif value == 'proximo_vencimento':
            from datetime import timedelta
            limite = today + timedelta(days=30)
            return queryset.filter(
                data_validade__gte=today,
                data_validade__lte=limite
            )
        elif value == 'atencao':
            from datetime import timedelta
            limite_min = today + timedelta(days=31)
            limite_max = today + timedelta(days=90)
            return queryset.filter(
                data_validade__gte=limite_min,
                data_validade__lte=limite_max
            )
        elif value == 'ok':
            from datetime import timedelta
            limite = today + timedelta(days=90)
            return queryset.filter(data_validade__gt=limite)
        
        return queryset

    def filter_search(self, queryset, name, value):
        """
        Filtro de busca geral que procura em múltiplos campos.
        """
        return queryset.filter(
            models.Q(tipo_produto__icontains=value) |
            models.Q(marca__icontains=value) |
            models.Q(fornecedor__icontains=value) |
            models.Q(observacoes__icontains=value)
        )

