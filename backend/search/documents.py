from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from etfs.models import ETF

@registry.register_document
class ETFDocument(Document):
    # Use fields.TextField for creator"s username (or another field you"d like to include)
    name = fields.TextField(attr="name")
    code = fields.TextField(attr="code")
    creator = fields.TextField(attr="creator.username")
    description = fields.TextField(attr="description")
    category = fields.TextField(attr="category.subcategory_name")
    current_investment = fields.DoubleField(attr="current_investment")
    fundraising_start_date = fields.DateField(attr="fundraising_start_date")
    fundraising_end_date = fields.DateField(attr="fundraising_end_date")

    class Index:
        name = "etfs"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}

    class Django:
        model = ETF  # The model associated with this Document
        fields = [
            "created_at",
        ]