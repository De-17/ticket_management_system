from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .llm import classify_description
from .models import Ticket
from .serializers import TicketClassifySerializer, TicketSerializer


class TicketListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer

    def get_queryset(self):
        queryset = Ticket.objects.all().order_by("-created_at")
        params = self.request.query_params

        category = params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        priority = params.get("priority")
        if priority:
            queryset = queryset.filter(priority=priority)

        ticket_status = params.get("status")
        if ticket_status:
            queryset = queryset.filter(status=ticket_status)

        search = params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset


class TicketPartialUpdateAPIView(generics.UpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    http_method_names = ["patch"]


class TicketStatsAPIView(APIView):
    def get(self, request):
        queryset = Ticket.objects.all()

        summary = queryset.aggregate(
            total_tickets=Count("id"),
            open_tickets=Count("id", filter=Q(status=Ticket.Status.OPEN)),
        )

        avg_per_day = (
            queryset.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(day_total=Count("id"))
            .aggregate(avg_tickets_per_day=Avg("day_total"))
        )

        priority_breakdown = {choice[0]: 0 for choice in Ticket.Priority.choices}
        for row in queryset.values("priority").annotate(count=Count("id")):
            priority_breakdown[row["priority"]] = row["count"]

        category_breakdown = {choice[0]: 0 for choice in Ticket.Category.choices}
        for row in queryset.values("category").annotate(count=Count("id")):
            category_breakdown[row["category"]] = row["count"]

        return Response(
            {
                "total_tickets": summary["total_tickets"] or 0,
                "open_tickets": summary["open_tickets"] or 0,
                "avg_tickets_per_day": round(avg_per_day["avg_tickets_per_day"] or 0, 2),
                "priority_breakdown": priority_breakdown,
                "category_breakdown": category_breakdown,
            }
        )


class TicketClassifyAPIView(APIView):
    def post(self, request):
        serializer = TicketClassifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        description = serializer.validated_data["description"]
        result = classify_description(description)
        return Response(result, status=status.HTTP_200_OK)
