from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from Funds.models import Fund, UserFund
from django.utils import timezone

@registry.register_document
class FundDocument(Document):
    # Use fields.TextField for creator"s username (or another field you"d like to include)
    id = fields.IntegerField(attr="id")
    name = fields.TextField(attr="name")
    creator = fields.IntegerField(attr="creator.id")
    code = fields.TextField(
        fields={
            "keyword": fields.KeywordField()  # Case-sensitive, exact match version of "code"
        },
        attr="code"
    )
    category_code = fields.KeywordField(attr="category.category_code")
    subcategory_code = fields.KeywordField(attr="category.subcategory_code")
    subcategory_name = fields.KeywordField(attr="category.subcategory_name")
    announcing_start_date = fields.DateField(attr="announcing_start_date")
    announcing_end_date = fields.DateField(attr="announcing_end_date")
    fundraising_start_date = fields.DateField(attr="fundraising_start_date")
    fundraising_end_date = fields.DateField(attr="fundraising_end_date")
    months = fields.IntegerField(attr="Fund_duration")
    total_amount = fields.IntegerField(attr="total_amount")
    current_investment = fields.DoubleField(attr="current_investment")
    state = fields.TextField()
    is_open = fields.BooleanField(attr="is_open")
    
    userfund = fields.NestedField(properties={
        "user": fields.IntegerField(attr="user.id"),  # user_id field from UserFund
        "joined_date": fields.DateField(),
        "leave_date": fields.DateField(),
    })

    class Index:
        name = "funds"
        settings = {"number_of_shards": 1, "number_of_replicas": 0}

    class Django:
        model = Fund  # The model associated with this Document
        related_models = [UserFund]
        
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
    
    def get_queryset(self):
        # Join the related UserFund model to ensure we can access related data in Elasticsearch
        return super().get_queryset().prefetch_related('userfund_set__user')
    
    def get_instances_from_related(self, related_instance):
        """
        This method returns the main model instance(s) when a related model changes.
        """
        # Example for a foreign key relationship
        if isinstance(related_instance, UserFund):
            return [related_instance.fund]
        return None