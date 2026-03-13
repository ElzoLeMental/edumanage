from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    role_label = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "role_label", "permissions", "is_active", "date_joined",
        ]
        read_only_fields = ["date_joined"]

    def get_permissions(self, obj):
        return obj.permissions_list

    def get_role_label(self, obj):
        return obj.get_role_display()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "password", "is_active"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data["username"] = validated_data.get("email", "")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role", "is_active", "custom_permissions"]
        read_only_fields = ["id"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Permettre la connexion avec email OU username
        identifier = attrs.get(self.username_field, "")
        if "@" in identifier:
            try:
                user = User.objects.get(email=identifier)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
