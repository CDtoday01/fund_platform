from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django_elasticsearch_dsl.registries import registry
from etfs.models import ETF
@receiver(post_save, sender=ETF)
def update_document(sender, instance= None, created=False, **kwargs):
    """Update the ETFDocument in Elasticsearch when an ETF instance is updated or created"""
    registry.update(instance)
    
@receiver(post_delete, sender=ETF)
def delete_document(sender, instance=None, **kwargs):
    """Delete the ETFDocument in Elasticsearch when an ETF instance is deleted"""
    registry.delete(instance)