from elasticsearch_dsl import Document, Text, Keyword, Date
from django_elasticsearch_dsl import Document as DjangoDocument
from django_elasticsearch_dsl.registries import registry
from Funds.models import Fund

@registry.register_document
class FundIndex(DjangoDocument):
    name = Text()
    code = Keyword()
    category = Text()
    created_at = Date()
    updated_at = Date()

    class Index:
        name = 'fund'
    
    class Django:
        model = Fund  # 這裡要指定 Django 的 Fund 模型

