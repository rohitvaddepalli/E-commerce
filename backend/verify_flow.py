import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marketplace.settings')
django.setup()

from rest_framework.test import APIClient
from api.models import User, Product, Store, Order

client = APIClient()

print("--- Testing E-Commerce Flows ---")

# 1. Login as customer
login_res = client.post('/api/auth/login', {
    'email': 'customer@example.com',
    'password': 'customer123'
}, format='json')
assert login_res.status_code == 200, f"Customer login failed: {login_res.data}"
customer_token = login_res.data['token']
print("1. Customer login passed")

# 2. Get Products Catalog
prod_res = client.get('/api/products')
assert prod_res.status_code == 200
products = prod_res.data['products']
assert len(products) > 0, "No products found in catalog"
product = products[0]
print(f"2. Product catalog passed (found {len(products)} products, first: {product['name']})")

# 3. Add to Wishlist
client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
wish_res = client.post(f"/api/users/wishlist/{product['_id']}")
assert wish_res.status_code == 200, f"Wishlist add failed: {wish_res.data}"
print("3. Wishlist item added passed")

# 4. Checkout Order
order_data = {
    'items': [{
        'product': product['_id'],
        'quantity': 1
    }],
    'shippingAddress': {
        'street': '123 Main St',
        'city': 'San Francisco',
        'state': 'CA',
        'zipCode': '94105',
        'country': 'USA'
    },
    'paymentMethod': 'card'
}
order_res = client.post('/api/orders', order_data, format='json')
assert order_res.status_code == 201, f"Order placement failed: {order_res.data}"
order_id = order_res.data['order']['_id']
print(f"4. Customer order placed passed (Order #{order_res.data['order']['orderNumber']})")

# 5. Customer My Orders
my_orders_res = client.get('/api/orders/myorders')
assert my_orders_res.status_code == 200
assert len(my_orders_res.data['orders']) > 0
print("5. Customer my orders passed")

# 6. Seller Login & Seller Orders
client.credentials() # reset
seller_login = client.post('/api/auth/login', {
    'email': 'seller@example.com',
    'password': 'seller123'
}, format='json')
assert seller_login.status_code == 200
seller_token = seller_login.data['token']
client.credentials(HTTP_AUTHORIZATION=f'Bearer {seller_token}')

seller_orders = client.get('/api/orders/seller/orders')
assert seller_orders.status_code == 200
print(f"6. Seller orders passed (found {len(seller_orders.data['orders'])} seller orders)")

# 7. Admin Login & Stats
client.credentials() # reset
admin_login = client.post('/api/auth/login', {
    'email': 'admin@example.com',
    'password': 'admin123'
}, format='json')
assert admin_login.status_code == 200
admin_token = admin_login.data['token']
client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

stats_res = client.get('/api/admin/stats')
assert stats_res.status_code == 200
print(f"7. Admin dashboard stats passed: {stats_res.data['stats']}")

print("\nALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!")
