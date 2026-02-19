from django.urls import path

from .views import (
    TicketClassifyAPIView,
    TicketListCreateAPIView,
    TicketPartialUpdateAPIView,
    TicketStatsAPIView,
)


urlpatterns = [
    path("tickets/", TicketListCreateAPIView.as_view(), name="ticket-list-create"),
    path("tickets/stats/", TicketStatsAPIView.as_view(), name="ticket-stats"),
    path("tickets/classify/", TicketClassifyAPIView.as_view(), name="ticket-classify"),
    path("tickets/<int:pk>/", TicketPartialUpdateAPIView.as_view(), name="ticket-partial-update"),
]
