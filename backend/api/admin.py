from django.contrib import admin
from .models import User, Store, Product, Order, OrderItem, Review, Settings, Message


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'phone', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('name', 'email', 'phone')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'category', 'rating', 'review_count', 'is_active', 'is_verified', 'created_at')
    list_filter = ('is_active', 'is_verified', 'category', 'created_at')
    search_fields = ('name', 'description', 'owner__name', 'owner__email')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('line_no', 'product', 'store', 'seller', 'name', 'price', 'quantity')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'store', 'seller', 'category', 'price', 'stock', 'rating', 'is_active', 'created_at')
    list_filter = ('is_active', 'category', 'brand', 'created_at')
    search_fields = ('name', 'description', 'brand', 'store__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'status', 'payment_status', 'payment_method', 'total_price', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'customer__name', 'customer__email')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'line_no', 'name', 'price', 'quantity', 'store', 'seller')
    list_filter = ('store', 'seller')
    search_fields = ('name', 'order__order_number')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'is_verified_purchase', 'helpful_votes', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'created_at')
    search_fields = ('product__name', 'user__name', 'comment')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'tax_rate', 'shipping_fee', 'fixed_fee_per_order', 'updated_at')
    readonly_fields = ('updated_at',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('room_id', 'sender', 'text', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('room_id', 'sender__name', 'text')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
