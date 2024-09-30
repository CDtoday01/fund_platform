from datetime import datetime
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search
from django_elasticsearch_dsl_drf.filter_backends import (
    DefaultOrderingFilterBackend,
    FilteringFilterBackend,
    IdsFilterBackend,
    OrderingFilterBackend,
    SearchFilterBackend,
)
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError

from .documents import ETFDocument
from .serializers import ETFDocumentSerializer

class ETFSearchView(DocumentViewSet):
    document = ETFDocument
    serializer_class = ETFDocumentSerializer
    lookup_field = "id"
    permission_classes = [AllowAny]

    filter_backends = [
        DefaultOrderingFilterBackend,
        FilteringFilterBackend,
        IdsFilterBackend,
        OrderingFilterBackend,
        SearchFilterBackend,
    ]
    search_fields = ("name", "code")
    filter_fields = ("category", "created_at", "announcement_start_date", "announcement_end_date", "fundraising_start_date", "fundraising_end_date", "month")
    ordering_fields = ("announcement_start_date", "fundraising_start_date")
    ordering = ("-announcement_start_date", "-fundraising_start_date",)

    def get_queryset(self):
        # Fetch query parameters from the request
        q = self.request.GET.get("q", None)
        category = self.request.GET.get("category", None)
        start_date = self.request.GET.get("start", None)
        end_date = self.request.GET.get("end", None)
        fundraising = self.request.GET.get("fundraising", None)
        month = self.request.GET.get("month", None)
        # Validate date format
        def validate_date(date_str):
            try:
                return datetime.strptime(date_str, "%Y-%m-%d").isoformat()
            except ValueError:
                raise ValidationError(f"Invalid date format for {date_str}. Use YYYY-MM-DD.")

        # Validate and reformat start_date and end_date
        if start_date:
            start_date = validate_date(start_date)
            
        if end_date:
            end_date = validate_date(end_date)

        # Initialize the Elasticsearch client
        client = Elasticsearch()
        
        # Initialize the search query
        s = Search(using=client)

        # Add a multi_match query if 'q' is provided
        if q:
            s = s.query("multi_match", query=q, fields=["name", "code"], fuzziness="AUTO")

        # Filter by category if provided
        if category:
            s = s.filter("term", category=category)

        # Filter by month if provided
        if month:
            s = s.filter("term", month=month)

        # Time range filtering for announcement start and end dates
        if not fundraising:
            s = s.query(
                "bool",
                should=[
                    {
                        "range": {
                            "announcement_start_date": {
                                "gte": start_date,
                                "lte": end_date
                            }
                        }
                    },
                    {
                        "range": {
                            "announcement_end_date": {
                                "gte": start_date,
                                "lte": end_date
                            }
                        }
                    }
                ],
                minimum_should_match=1
            )
            s = s.sort({"announcement_start_date": {"order": "desc"}})
        # Time range filtering for fundraising start and end dates
        else:
            s = s.query(
                "bool",
                should=[
                    {
                        "range": {
                            "fundraising_start_date": {
                                "gte": start_date,
                                "lte": end_date
                            }
                        }
                    },
                    {
                        "range": {
                            "fundraising_end_date": {
                                "gte": start_date,
                                "lte": end_date
                            }
                        }
                    }
                ],
                minimum_should_match=1
            )
            s = s.sort({"fundraising_start_date": {"order": "desc"}})

        return s

    # Custom pagination logic
    def paginate_queryset(self, queryset, request):
        paginator = PageNumberPagination()
        page_size = int(self.request.GET.get("page_size", 10))  # Default to 10 if not provided
        page_number = int(self.request.GET.get(paginator.page_query_param, 1))

        # Use Elasticsearch pagination (from and size)
        queryset = queryset[(page_number - 1) * page_size : page_number * page_size]

        response = queryset.execute()
        total_results = response.hits.total.value

        return {
            "results": response.hits,
            "total": total_results,
            "has_next": page_number * page_size < total_results,
            "page": page_number,
        }

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Handle pagination for the search results
        paginated_data = self.paginate_queryset(queryset, request)

        # Serialize the results
        serializer = self.get_serializer(queryset, many=True)

        # Return the paginated response
        return Response({
            "results": serializer.data,
            "count": paginated_data["total"],
            "next": paginated_data["has_next"],
            "page": paginated_data["page"]
        })
