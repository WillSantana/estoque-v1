from rest_framework import serializers
from .models import Product, MovimentacaoEstoque, AlertaEstoque
from django.contrib.auth.models import User



class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Product.
    """
    valor_total = serializers.ReadOnlyField()
    dias_para_vencimento = serializers.ReadOnlyField()
    status_validade = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'tipo_produto',
            'marca',
            'quantidade',
            'peso',
            'fornecedor',
            'preco',
            'data_compra',
            'data_validade',
            'observacoes',
            'valor_total',
            'dias_para_vencimento',
            'status_validade',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def validate_quantidade(self, value):
        """Valida se a quantidade é positiva."""
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value

    def validate_peso(self, value):
        """Valida se o peso é positivo."""
        if value <= 0:
            raise serializers.ValidationError("O peso deve ser maior que zero.")
        return value

    def validate_preco(self, value):
        """Valida se o preço é positivo."""
        if value <= 0:
            raise serializers.ValidationError("O preço deve ser maior que zero.")
        return value

    def validate(self, data):
        """Validação customizada para datas."""
        data_compra = data.get('data_compra')
        data_validade = data.get('data_validade')
        
        if data_compra and data_validade:
            if data_validade <= data_compra:
                raise serializers.ValidationError(
                    "A data de validade deve ser posterior à data de compra."
                )
        
        return data


class ProductCreateSerializer(ProductSerializer):
    """
    Serializer específico para criação de produtos.
    """
    class Meta(ProductSerializer.Meta):
        fields = [
            'tipo_produto',
            'marca',
            'quantidade',
            'peso',
            'fornecedor',
            'preco',
            'data_compra',
            'data_validade',
            'observacoes'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listagem de produtos.
    """
    valor_total = serializers.ReadOnlyField()
    status_validade = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id',
            'tipo_produto',
            'marca',
            'quantidade',
            'peso',
            'fornecedor',
            'preco',
            'data_compra',
            'data_validade',
            'valor_total',
            'status_validade'
        ]
class MovimentacaoEstoqueSerializer(serializers.ModelSerializer):
    produto_descricao = serializers.CharField(source='produto.descricao', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = MovimentacaoEstoque
        fields = '__all__'
        read_only_fields = ('data', 'usuario')

class DashboardStatsSerializer(serializers.Serializer):
    """
    Serializer para estatísticas do dashboard.
    """
    total_produtos = serializers.IntegerField()
    total_valor_estoque = serializers.DecimalField(max_digits=15, decimal_places=2)
    produtos_vencidos = serializers.IntegerField()
    produtos_proximos_vencimento = serializers.IntegerField()
    marcas_mais_registradas = serializers.ListField(
        child=serializers.DictField()
    )
    tipos_mais_registrados = serializers.ListField(
        child=serializers.DictField()
    )
    fornecedores_mais_utilizados = serializers.ListField(
        child=serializers.DictField()
    )

class AlertaEstoqueSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.tipo_produto', read_only=True)

    class Meta:
        model = AlertaEstoque
        fields = [
            'id',
            'produto',
            'produto_nome',
            'tipo',
            'mensagem',
            'nivel',
            'resolvido',
            'criado_em',
            'resolvido_em',
        ]
        read_only_fields = ['criado_em', 'resolvido_em']
