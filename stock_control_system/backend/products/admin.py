from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Configuração do Django Admin para o modelo Product.
    """
    list_display = [
        'tipo_produto', 
        'marca', 
        'quantidade', 
        'peso', 
        'fornecedor', 
        'preco', 
        'data_compra', 
        'data_validade',
        'status_validade',
        'created_by'
    ]
    
    list_filter = [
        'tipo_produto',
        'marca',
        'fornecedor',
        'data_compra',
        'data_validade',
        'created_at'
    ]
    
    search_fields = [
        'tipo_produto',
        'marca',
        'fornecedor',
        'observacoes'
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'valor_total',
        'dias_para_vencimento',
        'status_validade'
    ]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('tipo_produto', 'marca', 'fornecedor')
        }),
        ('Estoque', {
            'fields': ('quantidade', 'peso', 'preco')
        }),
        ('Datas', {
            'fields': ('data_compra', 'data_validade')
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Informações do Sistema', {
            'fields': (
                'created_by',
                'created_at',
                'updated_at',
                'valor_total',
                'dias_para_vencimento',
                'status_validade'
            ),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        """
        Salva o modelo associando o usuário que criou, se for novo.
        """
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
