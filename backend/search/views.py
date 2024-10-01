from datetime import datetime, timedelta
from elasticsearch_dsl import Q
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination

from .documents import ETFDocument
from .serializers import ETFDocumentSerializer

class ETFSearchView(DocumentViewSet):
    document = ETFDocument
    serializer_class = ETFDocumentSerializer
    pagination_class = PageNumberPagination
    lookup_field = "id"
    permission_classes = [AllowAny]

    multi_match_search_fields = {
        "name": {"fuzziness": "AUTO"},
        "code": None
    }

    filter_fields = {
        "category": "category.raw",  # Use .raw if needed for exact matches
        "created_at": "created_at",
        "announcing_start_date": "announcing_start_date",
        "announcing_end_date": "announcing_end_date",
        "fundraising_start_date": "fundraising_start_date",
        "fundraising_end_date": "fundraising_end_date",
        "month": "month",
        "state": "state.raw",  # Assuming state needs exact matching
    }

    ordering_fields = {
        "announcing_start_date": "announcing_start_date",
        "fundraising_start_date": "fundraising_start_date",
    }
    
    ordering = ["-announcing_start_date", "-fundraising_start_date"]

    def filter_queryset(self, queryset, *args, **kwargs):
        # Get search and filter parameters
        q = self.request.GET.get("q")
        category = self.request.GET.get("category")
        state = self.request.GET.get("state")

        # Validate and reformat dates
        start_date = self.request.GET.get("start")
        end_date = self.request.GET.get("end")
        
        def validate_date(date_str, is_end_date=False):
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d")
                if is_end_date:
                    # Set time to the end of the day for the end date
                    date = date + timedelta(hours=23, minutes=59, seconds=59)
                return date.isoformat()
            except ValueError:
                raise ValidationError(f"Invalid date format for {date_str}. Use YYYY-MM-DD.")

        if start_date:
            start_date = validate_date(start_date)
        if end_date:
            end_date = validate_date(end_date, is_end_date=True)

        # Apply search logic
        if q:
            # Fuzzy search on "name" field
            name_query = Q("match", name={"query": q, "fuzziness": "AUTO"})
            # Case-sensitive exact match on "code" field using 'keyword'
            code_query = Q("term", code__keyword=q)
            
            # Combine the queries
            queryset = queryset.query(
                "bool",
                should=[name_query, code_query],
                minimum_should_match=1
            )

        # Apply category filter if provided
        if category:
            queryset = queryset.filter("term", category=category)

        # Apply state filter if provided
        if state:
            queryset = queryset.filter("term", state=state)

        # Time range filtering for fundraising start and end dates
        if start_date and end_date:
            if  state == "fundraising":
                queryset = queryset.query(
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
            # Time range filtering for announcing start and end dates
            else:
                queryset = queryset.query(
                    "bool",
                    should=[
                        {
                            "range": {
                                "announcing_start_date": {
                                    "gte": start_date,
                                    "lte": end_date
                                }
                            }
                        },
                        {
                            "range": {
                                "announcing_end_date": {
                                    "gte": start_date,
                                    "lte": end_date
                                }
                            }
                        }
                    ],
                    minimum_should_match=1
                )
        return queryset
