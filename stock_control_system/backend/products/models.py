from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date


class Product(models.Model):
    tipo_produto = models.CharField(max_length=100, verbose_name="Tipo do Produto")
    marca = models.CharField(max_length=100, verbose_name="Marca")
    quantidade = models.PositiveIntegerField(verbose_name="Quantidade")
    peso = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Peso (kg)")
    fornecedor = models.CharField(max_length=150, verbose_name="Fornecedor")
    preco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço (R$)")
    data_compra = models.DateField(verbose_name="Data da Compra")
    data_validade = models.DateField(verbose_name="Data de Validade")
    observacoes = models.TextField(blank=True, null=True, verbose_name="Observações")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Criado por")

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.marca} - {self.tipo_produto} ({self.quantidade} unidades)"

    @property
    def valor_total(self):
        return self.preco * self.quantidade if self.preco and self.quantidade else 0

    @property
    def dias_para_vencimento(self):
        if self.data_validade:
            delta = self.data_validade - date.today()
            return delta.days
        return None

    @property
    def status_validade(self):
        dias = self.dias_para_vencimento
        if dias is None:
            return "Sem validade"
        elif dias < 0:
            return "Vencido"
        elif dias <= 7:
            return "Próximo ao vencimento"
        elif dias <= 30:
            return "Atenção"
        else:
            return "Válido"

    valor_total.fget.short_description = "Valor Total"
    dias_para_vencimento.fget.short_description = "Dias para Vencimento"
    status_validade.fget.short_description = "Status de Validade"


class MovimentacaoEstoque(models.Model):
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]

    MOTIVO_CHOICES = [
        ('COMPRA', 'Compra'),
        ('VENDA', 'Venda'),
        ('AJUSTE', 'Ajuste de estoque'),
        ('PERDA', 'Perda/Descarte'),
        ('DEVOLUCAO', 'Devolução'),
        ('OUTRO', 'Outro'),
    ]

    produto = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movimentacoes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    motivo = models.CharField(max_length=15, choices=MOTIVO_CHOICES)
    quantidade = models.PositiveIntegerField()
    data = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    observacoes = models.TextField(blank=True, null=True)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ['-data']
        verbose_name = 'Movimentação de Estoque'
        verbose_name_plural = 'Movimentações de Estoque'

    def __str__(self):
        return f"{self.get_tipo_display()} de {self.quantidade} {self.produto}"

    def save(self, *args, **kwargs):
        if not self.pk:
            if self.tipo == 'ENTRADA':
                self.produto.quantidade += self.quantidade
            else:
                self.produto.quantidade = max(0, self.produto.quantidade - self.quantidade)
            self.produto.save()
        super().save(*args, **kwargs)


class AlertaEstoque(models.Model):
    TIPO_CHOICES = [
        ('ESTOQUE_BAIXO', 'Estoque Baixo'),
        ('PROXIMO_VENCIMENTO', 'Próximo do Vencimento'),
        ('PRODUTO_SEM_MOVIMENTACAO', 'Produto sem Movimentação'),
    ]

    produto = models.ForeignKey(Product, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    mensagem = models.TextField()
    nivel = models.CharField(max_length=20, choices=[
        ('BAIXO', 'Baixo'),
        ('MEDIO', 'Médio'),
        ('ALTO', 'Alto')
    ])
    resolvido = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    resolvido_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-criado_em']
        verbose_name = 'Alerta de Estoque'
        verbose_name_plural = 'Alertas de Estoque'

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.produto}"


class Lote(models.Model):
    produto = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='lotes')
    numero = models.CharField(max_length=50)
    data_validade = models.DateField()
    quantidade = models.PositiveIntegerField()
    data_fabricacao = models.DateField(null=True, blank=True)
    observacoes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['data_validade']
        verbose_name = 'Lote'
        verbose_name_plural = 'Lotes'

    def __str__(self):
        return f"Lote {self.numero} - {self.produto}"
