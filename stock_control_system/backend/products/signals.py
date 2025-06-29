from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Produto, AlertaEstoque

@receiver(post_save, sender=Produto)
def verificar_alertas_produto(sender, instance, **kwargs):
    # Alertas de estoque baixo
    if instance.quantidade <= 5:
        AlertaEstoque.objects.get_or_create(
            produto=instance,
            tipo='ESTOQUE_BAIXO',
            defaults={
                'mensagem': f"Estoque baixo para {instance.descricao}. Quantidade atual: {instance.quantidade}",
                'nivel': 'ALTO' if instance.quantidade <= 2 else 'MEDIO'
            }
        )
    
    # Alertas de vencimento próximo (30 dias)
    if instance.data_validade:
        dias_para_vencer = (instance.data_validade - timezone.now().date()).days
        if 0 <= dias_para_vencer <= 30:
            AlertaEstoque.objects.get_or_create(
                produto=instance,
                tipo='PROXIMO_VENCIMENTO',
                defaults={
                    'mensagem': f"Produto {instance.descricao} próximo do vencimento. Validade: {instance.data_validade.strftime('%d/%m/%Y')}",
                    'nivel': 'ALTO' if dias_para_vencer <= 7 else 'MEDIO'
                }
            )