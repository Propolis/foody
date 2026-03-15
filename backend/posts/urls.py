from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, RestaurantViewSet, DishViewSet

router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'dishes', DishViewSet, basename='dish')
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
]
