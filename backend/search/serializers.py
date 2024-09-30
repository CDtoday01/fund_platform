from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from .documents import ETFDocument

class ETFDocumentSerializer(DocumentSerializer):
    class Meta:
        document = ETFDocument
        fields = [
            "name",
            "code",
            "category",
            "announcement_start_date",
            "announcement_end_date",
            "fundraising_start_date",
            "fundraising_end_date",
            "month"
        ]
