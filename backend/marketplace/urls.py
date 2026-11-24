from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.utils import timezone
from django.conf import settings
from django.conf.urls.static import static

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'ok',
        'timestamp': timezone.now().isoformat()
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health_check),
    path('api/v1/', include('api.urls')),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
