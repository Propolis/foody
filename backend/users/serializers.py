from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'bio_text', 'avatar', 'birth_date', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class FeedPostAuthorSerializer(serializers.ModelSerializer):
    """
    Легковесный сериализатор для отображения автора в ленте постов.
    Содержит только минимум данных для экономии трафика.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'avatar')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm', 'full_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Пароли не совпадают."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', '')
        )
        return user
