from django.core.management.base import BaseCommand
from etfs.models import ETF
from elasticsearch import Elasticsearch
from etfs.search_index import ETFIndex

class Command(BaseCommand):
    help = 'Sync ETF data with Elasticsearch'

    def handle(self, *args, **kwargs):
        es = Elasticsearch()
        for etf in ETF.objects.all():
            doc = ETFIndex(
                meta={'id': etf.id},
                name=etf.name,
                code=etf.code,
                category=etf.subcategory_name,
                created_at=etf.created_at,
                updated_at=etf.updated_at
            )
            doc.save(index='etfs')
        self.stdout.write(self.style.SUCCESS('Successfully synced ETFs with Elasticsearch'))
