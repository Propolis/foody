from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

User = settings.AUTH_USER_MODEL

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name='Название тега')
    usage_count = models.PositiveIntegerField(default=0, db_index=True, verbose_name='Количество использований')

    def __str__(self):
        return self.name

class Restaurant(models.Model):
    name = models.CharField(max_length=255, db_index=True, verbose_name='Название ресторана')
    address = models.CharField(max_length=100, verbose_name='Адрес')
    tags = models.ManyToManyField(Tag, through='RestaurantTag', related_name='restaurants', verbose_name='Теги ресторана')

    class Meta:
        verbose_name = 'Ресторан'
        verbose_name_plural = 'Рестораны'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.address})"

class RestaurantTag(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('restaurant', 'tag')
        indexes = [
            models.Index(fields=['-created_at']),
        ]

class Dish(models.Model):
    name = models.CharField(max_length=50, db_index=True, verbose_name='Название блюда')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='dishes', verbose_name='Ресторан')
    tags = models.ManyToManyField(Tag, through='DishTag', related_name='dishes', verbose_name='Теги блюда')

    class Meta:
        verbose_name = 'Блюдо'
        verbose_name_plural = 'Блюда'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"

class DishTag(models.Model):
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('dish', 'tag')
        indexes = [
            models.Index(fields=['-created_at']),
        ]

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='posts')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts', verbose_name='Ресторан')
    dish = models.ForeignKey(Dish, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts', verbose_name='Блюдо')
    
    description = models.TextField(verbose_name='Текст поста')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField(Tag, through='PostTag', related_name='posts', verbose_name='Теги')
    
    class Meta:
        indexes = [
            models.Index(fields=['-created_at']),
        ]
        verbose_name = 'Пост'
        verbose_name_plural = 'Посты'

class PostTag(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'tag')
        indexes = [
            models.Index(fields=['-created_at']),
        ]

class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    # Используем ImageField для хранения на Я.Облаке (VM). DRF сериализатор
    # сам преобразует это в URL http://server_ip/media/post_images/...
    image = models.ImageField(upload_to='post_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class PostStatistics(models.Model):
    post = models.OneToOneField(Post, on_delete=models.CASCADE, related_name='statistics')
    
    rating_taste = models.FloatField(default=0.0, verbose_name='Оценка за вкус')
    rating_appearance = models.FloatField(default=0.0, verbose_name='Оценка за внешний вид')
    rating_satiety = models.FloatField(default=0.0, verbose_name='Оценка за сытность')
    
    likes_count = models.PositiveIntegerField(default=0, verbose_name='Количество лайков')
    saves_count = models.PositiveIntegerField(default=0, verbose_name='Количество сохранений')
    comments_count = models.PositiveIntegerField(default=0, verbose_name='Количество комментариев')

class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='liked_posts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # У уникальности с null=True в Postgres проблем нет: разные NULL не равны,
        # но так как юзеры удаляются, мы можем получить дубли NULL. Прагматично оставлять логи.
        unique_together = ('post', 'user')
        indexes = [
            models.Index(fields=['-created_at']),
        ]

class PostSave(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saves')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='saved_posts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')
        indexes = [
            models.Index(fields=['-created_at']),
        ]

class PostReview(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='post_reviews')
    
    taste = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(10.0)], verbose_name='Вкус')
    appearance = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(10.0)], verbose_name='Внешний вид')
    satiety = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(10.0)], verbose_name='Сытность')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')
        indexes = [
            models.Index(fields=['-created_at']),
        ]

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', verbose_name='Пост')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='comments', verbose_name='Автор')
    text = models.TextField(verbose_name='Текст комментария')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Время публикации')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        username = self.user.username if self.user else 'Unknown'
        return f"Comment by {username} on {self.post}"
