# products/serializers.py

from rest_framework import serializers
from .models import Product, MovimentacaoEstoque, AlertaEstoque

print("DEBUG: products/serializers.py está sendo carregado!") # <-- ADICIONE ESTA LINHA

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializador padrão para o modelo Product.
    Usado para operações CRUD gerais.
    """
    class Meta:
        model = Product
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        # Permite passar um argumento 'fields' para incluir/excluir campos dinamicamente
        # Útil para a exportação, onde alguns campos podem ser opcionais.
        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Remove os campos que não estão na lista de 'fields'
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class ProductCreateSerializer(serializers.ModelSerializer):
    """
    Serializador para criação de produtos, excluindo campos gerenciados pelo sistema.
    """
    class Meta:
        model = Product
        exclude = ['created_by', 'created_at'] # created_by e created_at são preenchidos automaticamente


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializador para listar produtos, adaptando nomes de campos para o frontend.
    """
    nome = serializers.CharField(source='tipo_produto', read_only=True)
    distribuidora = serializers.CharField(source='fornecedor', read_only=True)
    unidades = serializers.IntegerField(source='quantidade', read_only=True)
    
    # Usamos SerializerMethodField para formatar 'created_at' como 'data_cadastro'
    # e garantir que ele seja um objeto date.
    data_cadastro = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'nome',
            'marca',
            'distribuidora',
            'preco',
            'unidades',
            'data_cadastro', # Este campo será preenchido pelo get_data_cadastro
        ]

    def get_data_cadastro(self, obj):
        print(f"DEBUG: Tipo de obj em get_data_cadastro: {type(obj)}") # <-- ADICIONE ESTA LINHA
        print(f"DEBUG: obj: {obj}") # <-- ADICIONE ESTA LINHA
        return obj.created_at.date() if obj.created_at else None


class MovimentacaoEstoqueSerializer(serializers.ModelSerializer):
    """
    Serializador para o modelo MovimentacaoEstoque.
    """
    class Meta:
        model = MovimentacaoEstoque
        fields = '__all__'


class AlertaEstoqueSerializer(serializers.ModelSerializer):
    """
    Serializador para o modelo AlertaEstoque, incluindo detalhes do produto relacionado.
    """
    produto_nome = serializers.CharField(source='produto.tipo_produto', read_only=True)
    produto_marca = serializers.CharField(source='produto.marca', read_only=True)
    produto_validade = serializers.DateField(source='produto.data_validade', read_only=True)
    produto_quantidade = serializers.IntegerField(source='produto.quantidade', read_only=True)

    class Meta:
        model = AlertaEstoque
        fields = [
            'id',
            'produto_nome',
            'produto_marca',
            'produto_validade',
            'produto_quantidade',
            'mensagem',
            'criado_em',
            'resolvido',
            'resolvido_em',
        ]


class DashboardStatsSerializer(serializers.Serializer):
    """
    Serializador para os dados estatísticos do Dashboard.
    """
    total_produtos = serializers.IntegerField()
    total_unidades = serializers.IntegerField()
    total_valor_estoque = serializers.DecimalField(max_digits=12, decimal_places=2)
    produtos_vencidos = serializers.IntegerField()
    produtos_proximos_vencimento = serializers.IntegerField()
    marcas_mais_registradas = serializers.ListField() # Lista de dicionários (ex: {'marca': 'Royal Canin', 'total': 5})
    produtos_por_tipo = serializers.ListField()      # Lista de dicionários (ex: {'name': 'Ração', 'value': 3})
    
    # Usa o ProductListSerializer para serializar os produtos recentes
    produtos_recentes = ProductListSerializer(many=True) 
    
    alertas_vencimento = AlertaEstoqueSerializer(many=True)


