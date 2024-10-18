from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from .documents import FundDocument

class FundDocumentSerializer(DocumentSerializer):
    class Meta:
        document = FundDocument
        fields = [
            "id",
            "name",
            "creator",
            "code",
            "category_code",
            "subcategory_code",
            "subcategory_name",
            "announcing_start_date",
            "announcing_end_date",
            "fundraising_start_date",
            "fundraising_end_date",
            "months",
            "total_amount",
            "current_investment",
            "state",
            "is_open",
        ]