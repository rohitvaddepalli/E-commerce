from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import Order, OrderItem, Product, User
from api.permissions import IsSeller, IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSeller])
def seller_sales_analytics(request):
    try:
        period = int(request.query_params.get('period', 30))
    except (ValueError, TypeError):
        period = 30
    start_date = timezone.now() - timedelta(days=period)

    seller_items = OrderItem.objects.filter(seller_id=request.user.id)
    recent_items = seller_items.filter(order__created_at__gte=start_date)

    total_sales = recent_items.aggregate(total=Sum('price'))['total'] or 0.0
    total_units = recent_items.aggregate(units=Sum('quantity'))['units'] or 0
    distinct_orders = recent_items.values('order_id').distinct().count()
    aov = round(total_sales / distinct_orders, 2) if distinct_orders > 0 else 0.0

    # Daily sales data for the chart
    days_to_show = min(period, 14)
    daily_sales = {}
    for i in range(days_to_show - 1, -1, -1):
        d_str = (timezone.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        daily_sales[d_str] = 0.0

    for item in recent_items.select_related('order'):
        if item.order and item.order.created_at:
            d_str = item.order.created_at.strftime('%Y-%m-%d')
            if d_str in daily_sales:
                daily_sales[d_str] += float(item.price or 0.0)

    sales_list = [{'date': d, 'revenue': round(rev, 2)} for d, rev in sorted(daily_sales.items())]

    return Response({
        'success': True,
        'analytics': {
            'totalRevenue': round(total_sales, 2),
            'totalUnitsSold': total_units,
            'totalOrders': distinct_orders,
            'averageOrderValue': aov,
            'salesData': sales_list
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSeller])
def seller_customer_analytics(request):
    seller_items = OrderItem.objects.filter(seller_id=request.user.id).select_related('order', 'order__customer')
    customer_stats = {}
    for item in seller_items:
        cust = item.order.customer if item.order else None
        if not cust:
            continue
        cid = str(cust.id)
        if cid not in customer_stats:
            customer_stats[cid] = {
                'name': cust.name or cust.email,
                'email': cust.email,
                'totalOrders': 0,
                'totalSpent': 0.0,
                'lastOrderDate': item.order.created_at.isoformat() if item.order.created_at else ''
            }
        customer_stats[cid]['totalOrders'] += 1
        customer_stats[cid]['totalSpent'] += float(item.price or 0.0)

    top_customers = sorted(customer_stats.values(), key=lambda x: x['totalSpent'], reverse=True)[:10]
    total_customers = len(customer_stats)
    repeat_customers = sum(1 for c in customer_stats.values() if c['totalOrders'] > 1)
    repeat_rate = round((repeat_customers / total_customers * 100), 1) if total_customers > 0 else 0.0

    return Response({
        'success': True,
        'analytics': {
            'totalCustomers': total_customers,
            'repeatCustomerRate': repeat_rate,
            'topCustomers': top_customers
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSeller])
def seller_product_analytics(request):
    seller_items = OrderItem.objects.filter(seller_id=request.user.id).select_related('product')
    prod_agg = {}
    cat_agg = {}
    for item in seller_items:
        p_name = item.name or (item.product.name if item.product else 'Product')
        p_cat = (item.product.category if item.product else 'General') or 'General'
        qty = item.quantity or 1
        price = float(item.price or 0.0)

        if p_name not in prod_agg:
            prod_agg[p_name] = {'name': p_name, 'category': p_cat, 'totalSold': 0, 'revenue': 0.0}
        prod_agg[p_name]['totalSold'] += qty
        prod_agg[p_name]['revenue'] += price

        if p_cat not in cat_agg:
            cat_agg[p_cat] = {'revenue': 0.0, 'unitsSold': 0}
        cat_agg[p_cat]['revenue'] += price
        cat_agg[p_cat]['unitsSold'] += qty

    top_products = sorted(prod_agg.values(), key=lambda x: x['totalSold'], reverse=True)[:10]

    return Response({
        'success': True,
        'analytics': {
            'topProducts': top_products,
            'categoryPerformance': cat_agg
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSeller])
def seller_inventory_forecast(request):
    products = Product.objects.filter(seller_id=request.user.id)
    forecast = []
    for p in products:
        recent_sold = OrderItem.objects.filter(
            product=p,
            seller_id=request.user.id,
            order__created_at__gte=timezone.now() - timedelta(days=30)
        ).aggregate(total=Sum('quantity'))['total'] or 0
        avg_daily = round(recent_sold / 30.0, 2)
        stock = p.stock or 0
        days_until = int(stock / avg_daily) if avg_daily > 0 else 999
        reorder = stock <= (p.low_stock_threshold or 10) or days_until < 14
        forecast.append({
            'name': p.name,
            'currentStock': stock,
            'averageDailySales': avg_daily,
            'daysUntilStockout': days_until,
            'reorderRecommended': reorder
        })

    return Response({
        'success': True,
        'forecast': forecast
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_sales_analytics(request):
    agg = Order.objects.filter(status__in=['processing', 'shipped', 'delivered'])\
        .aggregate(rev=Sum('total_price'), cnt=Count('id'))
    return Response({
        'success': True,
        'analytics': {
            'totalRevenue': round(agg['rev'] or 0.0, 2),
            'totalOrders': agg['cnt'] or 0
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_customer_analytics(request):
    customers = User.objects.filter(role='customer').count()
    sellers = User.objects.filter(role='seller').count()
    return Response({'success': True, 'customers': customers, 'sellers': sellers})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_product_analytics(request):
    total = Product.objects.count()
    active = Product.objects.filter(is_active=True).count()
    return Response({'success': True, 'total': total, 'active': active})
