from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from api.models import User
from api.serializers import UserPublicSerializer
from api.authentication import generate_token

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    role = data.get('role', 'customer')
    phone = data.get('phone')

    if not name or not email or not password:
        return Response({
            'success': False,
            'message': 'Name, email, and password are required'
        }, status=400)

    if role not in ['customer', 'seller', 'admin']:
        role = 'customer'

    if User.objects.filter(email__iexact=email).exists():
        return Response({
            'success': False,
            'message': 'User with this email already exists'
        }, status=400)

    user = User(
        name=name,
        email=email,
        role=role,
        phone=phone
    )
    user.set_password(password)
    user.save()

    token = generate_token(user)
    return Response({
        'success': True,
        'token': token,
        'user': UserPublicSerializer(user).data
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return Response({
            'success': False,
            'message': 'Email and password are required'
        }, status=400)

    user = User.objects.filter(email__iexact=email).first()
    if not user or not user.check_password(password):
        return Response({
            'success': False,
            'message': 'Invalid email or password'
        }, status=401)

    token = generate_token(user)
    return Response({
        'success': True,
        'token': token,
        'user': UserPublicSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    return Response({
        'success': True,
        'user': UserPublicSerializer(request.user).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    allowed = ['name', 'phone', 'address']
    updated = False

    for field in allowed:
        if field in request.data:
            setattr(user, field, request.data[field])
            updated = True

    if not updated:
        return Response({
            'success': False,
            'message': 'No valid fields to update'
        }, status=400)

    user.save()
    return Response({
        'success': True,
        'user': UserPublicSerializer(user).data
    })


@api_view(['POST'])
def logout_view(request):
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })
