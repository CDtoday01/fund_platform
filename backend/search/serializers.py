from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from .documents import ETFDocument

class ETFDocumentSerializer(DocumentSerializer):
    class Meta:
        document = ETFDocument
        fields = [
            "id",
            "name",
            "code",
            "category",
            "announcing_start_date",
            "announcing_end_date",
            "fundraising_start_date",
            "fundraising_end_date",
            "month",
            "total_amount",
            "current_investment",
            "state",
        ]
