import logging
import datetime
import jwt
from jwt.exceptions import PyJWTError, ExpiredSignatureError
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from api.models import User

logger = logging.getLogger(__name__)


def generate_token(user):
    secret_key = getattr(settings, 'JWT_SECRET_KEY', settings.SECRET_KEY)
    payload = {
        'user_id': str(user.id),
        'email': user.email,
        'role': user.role,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        'iat': datetime.datetime.now(datetime.timezone.utc),
    }
    return jwt.encode(payload, secret_key, algorithm='HS256')


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1].strip()
        if not token:
            return None

        secret_key = getattr(settings, 'JWT_SECRET_KEY', settings.SECRET_KEY)

        try:
            payload = jwt.decode(
                token,
                secret_key,
                algorithms=['HS256'],
                options={
                    'verify_signature': True,
                    'verify_exp': True,
                },
            )

            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Token missing user identifier')

            user = User.objects.filter(id=user_id).first()
            if not user:
                raise AuthenticationFailed('User not found')

            user._id = user.id
            return (user, token)

        except ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except PyJWTError as e:
            raise AuthenticationFailed(f'Invalid token: {e}') from e
        except AuthenticationFailed:
            raise
        except Exception as e:
            logger.exception('Unexpected authentication error: %s', e)
            raise AuthenticationFailed('Authentication error') from e

    def authenticate_header(self, request):
        return 'Bearer realm="api"'
