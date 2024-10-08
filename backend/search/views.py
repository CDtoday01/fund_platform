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
        months = self.request.GET.get("months")  # Add months parameter

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
            # Main category only contains alphabet
            if category.isalpha():
                # Filter by the main category
                queryset = queryset.filter("term", category_code=category)
            else:
                queryset = queryset.filter("term", subcategory_code=category)

        # Apply state filter if provided
        if state:
            queryset = queryset.filter("term", state=state)

        # Apply months filter if provided
        if months is not None:
            queryset = queryset.filter("term", months=int(months))  # Assuming months is an integer

        # Time range filtering for fundraising start and end dates
        if start_date and end_date:
            if state == "fundraising":
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

