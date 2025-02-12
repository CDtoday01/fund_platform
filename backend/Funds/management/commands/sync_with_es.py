from django.core.management.base import BaseCommand
from Funds.models import Fund
from elasticsearch import Elasticsearch
from Funds.search_index import FundIndex

class Command(BaseCommand):
    help = 'Sync Fund data with Elasticsearch'

    def handle(self, *args, **kwargs):
        for fund in Fund.objects.all():
            doc = FundIndex(
                meta={'id': fund.id},
                name=fund.name,
                code=fund.code,
                category=fund.category.subcategory_code,
                created_at=fund.created_at
            )
            doc.save(index='funds')
        self.stdout.write(self.style.SUCCESS('Successfully synced funds with Elasticsearch'))
