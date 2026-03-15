import pytest
from django.urls import reverse
from posts.models import Restaurant, Dish
from users.models import User
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_client(api_client):
    user = User.objects.create_user(username="testuser", email="test@mail.com", password="pwd")
    response = api_client.post(reverse('token_obtain_pair'), {"username": "testuser", "password": "pwd"})
    token = response.data['access']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client, user

@pytest.mark.django_db
class TestRestaurantsViews:
    
    def test_restaurant_search(self, auth_client):
        """
        Тест: Поиск ресторана по названию
        """
        client, _ = auth_client
        Restaurant.objects.create(name="McDonalds", address="Lenina 1")
        Restaurant.objects.create(name="KFC", address="Lenina 2")
        
        url = reverse('restaurant-list')
        
        # Запрос без поиска - отдает все
        res_all = client.get(url)
        assert res_all.status_code == 200
        assert len(res_all.data['results']) == 2
        
        # Поиск по имени
        res_search = client.get(f"{url}?search=McDonalds")
        assert res_search.status_code == 200
        assert len(res_search.data['results']) == 1
        assert res_search.data['results'][0]['name'] == "McDonalds"

    def test_dish_search_by_restaurant(self, auth_client):
        """
        Тест: Получение списка блюд конкретного ресторана и поиск по ним
        """
        client, _ = auth_client
        r1 = Restaurant.objects.create(name="R1", address="A1")
        r2 = Restaurant.objects.create(name="R2", address="A2")
        
        Dish.objects.create(name="Pizza", restaurant=r1)
        Dish.objects.create(name="Pasta", restaurant=r1)
        Dish.objects.create(name="Sushi", restaurant=r2)
        
        url = reverse('dish-list')
        
        # Фильтрация по ресторану
        res_r1 = client.get(f"{url}?restaurant_id={r1.id}")
        assert res_r1.status_code == 200
        assert len(res_r1.data['results']) == 2
        
        # Поиск внутри ресторана
        res_r1_search = client.get(f"{url}?restaurant_id={r1.id}&search=Pizza")
        assert res_r1_search.status_code == 200
        assert len(res_r1_search.data['results']) == 1
        assert res_r1_search.data['results'][0]['name'] == "Pizza"
