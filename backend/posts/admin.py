from django.contrib import admin
from .models import Post, PostStatistics, PostLike, PostSave, PostReview

class PostStatisticsInline(admin.StackedInline):
    model = PostStatistics
    readonly_fields = ('likes_count', 'saves_count', 'rating_taste', 'rating_appearance', 'rating_satiety')
    can_delete = False

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'price', 'created_at')
    search_fields = ('description', 'user__username')
    list_filter = ('created_at',)
    inlines = [PostStatisticsInline]

admin.site.register(PostStatistics)
admin.site.register(PostLike)
admin.site.register(PostSave)
admin.site.register(PostReview)
