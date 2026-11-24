from django.core.management.base import BaseCommand
from api.models import User, Store, Product, Settings

class Command(BaseCommand):
    help = 'Seeds initial sample data for simple e-commerce store'

    def handle(self, *args, **options):
        self.stdout.write('Seeding initial data...')

        # 1. Default Settings
        settings_obj, created = Settings.objects.get_or_create(id=True)
        settings_obj.tax_rate = 8.0
        settings_obj.shipping_fee = 10.0
        settings_obj.fixed_fee_per_order = 2.0
        settings_obj.save()
        self.stdout.write('Settings configured.')

        # 2. Admin User
        admin_user = User.objects.filter(email='admin@example.com').first()
        if not admin_user:
            admin_user = User(
                name='Admin User',
                email='admin@example.com',
                role='admin',
                phone='+1234567890'
            )
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created Admin: admin@example.com / admin123')
        else:
            admin_user.set_password('admin123')
            admin_user.save()

        # 3. Seller User & Store
        seller_user = User.objects.filter(email='seller@example.com').first()
        if not seller_user:
            seller_user = User(
                name='Alex Seller',
                email='seller@example.com',
                role='seller',
                phone='+1987654321'
            )
            seller_user.set_password('seller123')
            seller_user.save()
            self.stdout.write('Created Seller: seller@example.com / seller123')
        else:
            seller_user.set_password('seller123')
            seller_user.save()

        store = Store.objects.filter(owner=seller_user).first()
        if not store:
            store = Store.objects.create(
                owner=seller_user,
                name='Apex Tech Store',
                description='High quality electronics, smart gadgets, and everyday lifestyle accessories.',
                category='Electronics',
                logo='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60',
                banner='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
                address={'city': 'San Francisco', 'state': 'CA', 'country': 'USA'},
                contact={'email': 'seller@example.com', 'phone': '+1987654321'},
                rating=4.8,
                review_count=12,
                is_active=True,
                is_verified=True
            )
            self.stdout.write('Created Store: Apex Tech Store')

        # 4. Customer User
        customer_user = User.objects.filter(email='customer@example.com').first()
        if not customer_user:
            customer_user = User(
                name='Jane Customer',
                email='customer@example.com',
                role='customer',
                phone='+1555123456'
            )
            customer_user.set_password('customer123')
            customer_user.save()
            self.stdout.write('Created Customer: customer@example.com / customer123')
        else:
            customer_user.set_password('customer123')
            customer_user.save()

        # 5. Sample Products
        sample_products = [
            {
                'name': 'Wireless Noise-Canceling Headphones',
                'description': 'Experience pure audio bliss with active noise cancellation and 40-hour battery life.',
                'price': 199.99,
                'compare_at_price': 249.99,
                'category': 'Electronics',
                'brand': 'SoundPeak',
                'images': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
                'stock': 45,
                'rating': 4.9,
                'review_count': 38,
                'tags': ['audio', 'wireless', 'bluetooth', 'headphones'],
            },
            {
                'name': 'Minimalist Smart Watch Series 5',
                'description': 'All-day fitness tracking, heart rate monitor, sleep analysis, and water resistance up to 50m.',
                'price': 149.50,
                'compare_at_price': 189.00,
                'category': 'Electronics',
                'brand': 'Chronos',
                'images': ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
                'stock': 30,
                'rating': 4.7,
                'review_count': 24,
                'tags': ['smartwatch', 'fitness', 'wearable'],
            },
            {
                'name': 'Ergonomic Mechanical Keyboard',
                'description': 'Custom mechanical switches, RGB backlighting, and hot-swappable tactile keys for optimal typing comfort.',
                'price': 89.99,
                'compare_at_price': 119.99,
                'category': 'Accessories',
                'brand': 'KeyCraft',
                'images': ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'],
                'stock': 60,
                'rating': 4.8,
                'review_count': 19,
                'tags': ['keyboard', 'gaming', 'office', 'rgb'],
            },
            {
                'name': '4K Ultra HD Action Camera',
                'description': 'Rugged waterproof design, dual screens, and ultra-smooth image stabilization for extreme sports.',
                'price': 129.00,
                'compare_at_price': 169.00,
                'category': 'Cameras',
                'brand': 'ApexCam',
                'images': ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'],
                'stock': 20,
                'rating': 4.6,
                'review_count': 15,
                'tags': ['camera', '4k', 'video', 'sports'],
            },
            {
                'name': 'Fast Wireless Charging Pad 15W',
                'description': 'Sleek aluminum charging pad supporting Qi-enabled smartphones, earbuds, and accessories.',
                'price': 29.99,
                'compare_at_price': 39.99,
                'category': 'Accessories',
                'brand': 'VoltPower',
                'images': ['https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80'],
                'stock': 100,
                'rating': 4.5,
                'review_count': 42,
                'tags': ['charger', 'wireless', 'fast-charge'],
            },
            {
                'name': 'Premium Leather Backpack',
                'description': 'Handcrafted water-resistant leather laptop bag with dedicated 16-inch compartment and anti-theft pockets.',
                'price': 119.00,
                'compare_at_price': 159.00,
                'category': 'Fashion',
                'brand': 'UrbanCraft',
                'images': ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'],
                'stock': 25,
                'rating': 4.9,
                'review_count': 31,
                'tags': ['bag', 'backpack', 'leather', 'travel'],
            }
        ]

        for p_data in sample_products:
            prod = Product.objects.filter(name=p_data['name'], store=store).first()
            if not prod:
                Product.objects.create(
                    store=store,
                    seller=seller_user,
                    name=p_data['name'],
                    description=p_data['description'],
                    price=p_data['price'],
                    compare_at_price=p_data['compare_at_price'],
                    category=p_data['category'],
                    brand=p_data['brand'],
                    images=p_data['images'],
                    stock=p_data['stock'],
                    rating=p_data['rating'],
                    review_count=p_data['review_count'],
                    tags=p_data['tags'],
                    is_active=True
                )
                self.stdout.write(f"Created Product: {p_data['name']}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
