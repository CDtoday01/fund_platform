from django_elasticsearch_dsl_drf.filter_backends import (
    DefaultOrderingFilterBackend,
    FilteringFilterBackend,
    IdsFilterBackend,
    OrderingFilterBackend,
    SearchFilterBackend,
)
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from .documents import ETFDocument
from .serializers import ETFDocumentSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

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
    # Add search fields for querying
    search_fields = (
        "name",
        "description",
    )
    filter_fields = {"category": "category", "created_at": "created_at"}
    ordering_fields = {"created_at": "created_at"}
    ordering = ("-created_at",)

    # Custom method to replicate the current search logic
    def get_queryset(self):
        search_query = self.document.search()

        # Fetch query parameters from the request
        name = self.request.GET.get("name", None)
        lowest_investment = self.request.GET.get("lowest_investment", None)

        # Search by name if provided
        if name:
            search_query = search_query.query("match", name=name)

        # Filter by minimum investment amount if provided
        if lowest_investment:
            search_query = search_query.filter("range", investment_amount={"gte": lowest_investment})

        # Add sorting logic, e.g., by start date
        search_query = search_query.sort({"fundraising_start_date": {"order": "desc"}})

        return search_query

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        response = queryset.execute()  # Execute the search query
        serializer = self.get_serializer(response, many=True)
        return Response(serializer.data)
    