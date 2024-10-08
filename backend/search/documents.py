from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from etfs.models import ETF
from django.utils import timezone

@registry.register_document
class ETFDocument(Document):
    # Use fields.TextField for creator"s username (or another field you"d like to include)
    id = fields.IntegerField(attr="id")
    name = fields.TextField(attr="name")
    code = fields.TextField(
        fields={
            "keyword": fields.KeywordField()  # Case-sensitive, exact match version of 'code'
        },
        attr="code"
    )
    category = fields.TextField(attr="category.subcategory_name")
    announcing_start_date = fields.DateField(attr="announcing_start_date")
    announcing_end_date = fields.DateField(attr="announcing_end_date")
    fundraising_start_date = fields.DateField(attr="fundraising_start_date")
    fundraising_end_date = fields.DateField(attr="fundraising_end_date")
    months = fields.IntegerField(attr="ETF_duration")
    total_amount = fields.IntegerField(attr="total_amount")
    current_investment = fields.DoubleField(attr="current_investment")
    state = fields.TextField()

    class Index:
        name = "etfs"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}

    class Django:
        model = ETF  # The model associated with this Document
        fields = [
            "created_at",
        ]
        
    def prepare_state(self, instance):
        current_time = timezone.now()
        if current_time < instance.announcing_start_date:
            return "future"
        elif instance.announcing_start_date <= current_time < instance.announcing_end_date:
            return "announcing"
        elif instance.fundraising_start_date <= current_time <= instance.fundraising_end_date:
            return "fundraising"
        elif instance.fundraising_end_date < current_time:
            return "closed"
        return None