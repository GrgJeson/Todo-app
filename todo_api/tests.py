from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Todo, PriorityLevel

class TodoAPITests(APITestCase):

    def setUp(self):
        # Create two test users
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='Password123!'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='Password123!'
        )

        # URLs
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.todos_list_url = reverse('todo-list')

    def test_user_registration(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Password123!',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_registration_duplicate_email(self):
        data = {
            'username': 'anotheruser',
            'email': 'user1@example.com', # Duplicate email
            'password': 'Password123!'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_jwt(self):
        data = {
            'username': 'user1',
            'password': 'Password123!'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_todo_crud_authenticated(self):
        # Log in user1
        self.client.force_authenticate(user=self.user1)

        # Create Todo
        data = {
            'title': 'Test Todo',
            'description': 'Test Description',
            'priority': PriorityLevel.HIGH,
            'due_date': '2026-07-01'
        }
        response = self.client.post(self.todos_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        todo_id = response.data['id']
        self.assertEqual(response.data['title'], 'Test Todo')
        self.assertEqual(response.data['priority'], 'High')

        # Read Todo
        detail_url = reverse('todo-detail', args=[todo_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Todo')

        # Update Todo
        update_data = {
            'title': 'Updated Test Todo',
            'is_completed': True,
            'priority': PriorityLevel.LOW
        }
        response = self.client.patch(detail_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Test Todo')
        self.assertTrue(response.data['is_completed'])

        # Delete Todo
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Todo.objects.filter(id=todo_id).exists())

    def test_todo_title_validation(self):
        self.client.force_authenticate(user=self.user1)

        # Empty title should fail serializer validation
        data = {
            'title': '   ', # Whitespace only
            'priority': PriorityLevel.MEDIUM
        }
        response = self.client.post(self.todos_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_user_isolation(self):
        # Create a todo owned by user1
        todo_user1 = Todo.objects.create(
            user=self.user1,
            title="User 1 Secret Task",
            description="Only user1 should see this",
            priority=PriorityLevel.MEDIUM
        )

        # Log in as user2
        self.client.force_authenticate(user=self.user2)

        # 1. User2 lists todos -> Should not see User1's todo
        response = self.client.get(self.todos_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        # 2. User2 attempts to retrieve User1's todo -> Should return 404
        detail_url = reverse('todo-detail', args=[todo_user1.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # 3. User2 attempts to modify User1's todo -> Should return 404
        update_data = {'title': 'Hacked title'}
        response = self.client.patch(detail_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # 4. User2 attempts to delete User1's todo -> Should return 404
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Verify todo still exists in DB
        self.assertTrue(Todo.objects.filter(id=todo_user1.id).exists())

