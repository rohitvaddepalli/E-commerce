from django.test import TestCase
from rest_framework.test import APIClient
from api.models import User, Store, Product, Settings

class MarketplaceAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data.get('status'), 'ok')

    def test_settings_public(self):
        res = self.client.get('/api/settings')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data.get('success'))
        self.assertIn('settings', res.data)

    def test_products_list_public(self):
        res = self.client.get('/api/products')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data.get('success'))
        self.assertIn('products', res.data)

    def test_featured_products(self):
        res = self.client.get('/api/products/featured')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data.get('success'))
        self.assertIn('products', res.data)

    def test_auth_register_and_login(self):
        # 1. Register customer
        reg_res = self.client.post('/api/auth/register', {
            'name': 'Test User',
            'email': 'testuser@example.com',
            'password': 'password123',
            'role': 'customer'
        }, format='json')
        self.assertEqual(reg_res.status_code, 201)
        self.assertTrue(reg_res.data.get('success'))
        self.assertIn('token', reg_res.data)
        token = reg_res.data['token']

        # 2. Get me with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_res = self.client.get('/api/auth/me')
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.data['user']['email'], 'testuser@example.com')

        # 3. Login with credentials
        self.client.credentials()  # clear header
        login_res = self.client.post('/api/auth/login', {
            'email': 'testuser@example.com',
            'password': 'password123'
        }, format='json')
        self.assertEqual(login_res.status_code, 200)
        self.assertTrue(login_res.data.get('success'))
        self.assertIn('token', login_res.data)
