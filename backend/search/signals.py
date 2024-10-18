from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django_elasticsearch_dsl.registries import registry
from funds.models import Fund
@receiver(post_save, sender=Fund)
def update_document(sender, instance= None, created=False, **kwargs):
    """Update the FundDocument in Elasticsearch when an Fund instance is updated or created"""
    registry.update(instance)
    
@receiver(post_delete, sender=Fund)
def delete_document(sender, instance=None, **kwargs):
    """Delete the FundDocument in Elasticsearch when an Fund instance is deleted"""
    registry.delete(instance)