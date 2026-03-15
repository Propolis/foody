from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django.db.models import Prefetch

from ..models import Post, PostLike, PostSave
from ..serializers import PostListSerializer, PostCreateSerializer, CommentSerializer
from ..pagination import StandardResultsCursorPagination

class BasePostViewSet(viewsets.ModelViewSet):
    """
    CRUD Вьюсет для Постов. 
    Отвечает за права доступа и роутинг. Конкретная валидация данных — в сериализаторах.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsCursorPagination
    
    # Поиск по названию блюда и ресторана
    filter_backends = [SearchFilter]
    search_fields = ['dish__name', 'restaurant__name']
    
    def get_queryset(self):
        """
        Возвращает базовый QuerySet для постов с оптимизацией N+1 запросов.
        Если пользователь авторизован, подгружает его лайки и сохранения.
        """
        user = self.request.user
        posts_queryset = Post.objects.select_related('user', 'statistics').prefetch_related('images', 'tags')
        if user.is_authenticated:
            posts_queryset = posts_queryset.prefetch_related(
                Prefetch('likes', queryset=PostLike.objects.filter(user=user), to_attr='prefetched_likes'),
                Prefetch('saves', queryset=PostSave.objects.filter(user=user), to_attr='prefetched_saves')
            )
        return posts_queryset.order_by('-created_at')

    def get_serializer_class(self):
        """
        Определяет, какой сериализатор использовать в зависимости от выполняемого действия.
        Для чтения возвращает полный сериализатор, для записи - сериализатор создания.
        """
        # Для GET (list, retrieve, my_posts, saved_posts, user_posts) возвращаем полный граф
        if self.action in ['list', 'retrieve', 'my_posts', 'saved_posts', 'user_posts']:
            return PostListSerializer
        # Для POST, PUT, PATCH используем чисто валидационный сериализатор
        return PostCreateSerializer

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='my')
    def my_posts(self, request):
        """
        Возвращает список постов, созданных текущим авторизованным пользователем.
        Урл остается /api/posts/my/ для совместимости с фронтендом.
        """
        user_posts_queryset = self.filter_queryset(self.get_queryset().filter(user=request.user))
        
        # Подключаем пагинацию. 
        # Если страница запрошена, но пуста, пагинатор сам вернет пустой массив.
        page = self.paginate_queryset(user_posts_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(user_posts_queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='saved')
    def saved_posts(self, request):
        """
        Возвращает список постов, которые текущий пользователь добавил в сохраненное.
        Урл остается /api/posts/saved/ для совместимости.
        """
        saved_posts_queryset = self.filter_queryset(self.get_queryset().filter(saves__user=request.user))
        
        page = self.paginate_queryset(saved_posts_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(saved_posts_queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def user_posts(self, request):
        """
        Возвращает список постов (ленту) конкретного пользователя по параметру user_id.
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        target_user_posts_queryset = self.filter_queryset(self.get_queryset().filter(user_id=user_id))
        
        page = self.paginate_queryset(target_user_posts_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(target_user_posts_queryset, many=True)
        return Response(serializer.data)

    # Логика действий (Лайки, Сохранения, Комментарии) находится в PostActionsMixin,
    # который подмешивается в итоговый PostViewSet в __init__.py.
