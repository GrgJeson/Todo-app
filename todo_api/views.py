from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from .models import Todo, User
from .serializers import UserRegisterSerializer, TodoSerializer

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Customize response to return success status message
        return Response(
            {
                "message": "User registered successfully.",
                "user": {
                    "id": serializer.data.get("id"),
                    "username": serializer.data.get("username"),
                    "email": serializer.data.get("email")
                }
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Enforce user isolation: only return todos belonging to the authenticated user
        return Todo.objects.filter(user=self.request.user).order_by('due_date', '-created_at')

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the todo owner
        serializer.save(user=self.request.user)

