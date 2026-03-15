from rest_framework import viewsets, mixins
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

from ..models import Restaurant, Dish
from ..serializers import RestaurantSerializer, DishSerializer

class RestaurantViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Вьюсет для поиска ресторанов (только чтение).
    """
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [SearchFilter]
    search_fields = ['name']
    ordering = ['name']

class DishViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Вьюсет для подгрузки списка блюд ресторана (только чтение).
    """
    serializer_class = DishSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [SearchFilter]
    search_fields = ['name']
    ordering = ['name']

    def get_queryset(self):
        queryset = Dish.objects.all()
        restaurant_id = self.request.query_params.get('restaurant_id')
        if restaurant_id:
            queryset = queryset.filter(restaurant_id=restaurant_id)
        return queryset
