from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    CustomTokenObtainPairSerializer,
)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by("last_name")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            self._check_admin()
        return super().get_permissions()

    def _check_admin(self):
        if self.request.user.role != "admin":
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seul l'administrateur peut créer des utilisateurs.")


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance == request.user:
            return Response(
                {"detail": "Vous ne pouvez pas supprimer votre propre compte."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if request.user.role != "admin":
            return Response(
                {"detail": "Seul l'administrateur peut supprimer des utilisateurs."},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
