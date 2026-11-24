import os
import uuid
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_upload_signature(request):
    """
    Returns an upload endpoint indicator for clients that request signature.
    Clients can directly POST to /api/upload.
    """
    ext = request.GET.get('type', 'image/jpeg').split('/')[-1]
    key = f"uploads/{uuid.uuid4().hex}.{ext}"
    return Response({
        'success': True,
        'uploadUrl': '/api/upload',
        'publicUrl': f"{settings.MEDIA_URL}{key}",
        'key': key
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_files(request):
    files = request.FILES.getlist('images')
    if not files:
        # Check single file upload fallback
        single_file = request.FILES.get('image') or request.FILES.get('file')
        if single_file:
            files = [single_file]

    if not files:
        return Response({'success': False, 'message': 'No files uploaded'}, status=400)

    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    uploaded = []
    for f in files:
        ext = f.name.split('.')[-1].lower() if '.' in f.name else 'jpg'
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(upload_dir, filename)

        with open(filepath, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)

        content_type = getattr(f, 'content_type', '') or 'image/jpeg'
        relative_url = f"{settings.MEDIA_URL}uploads/{filename}"
        full_url = request.build_absolute_uri(relative_url)

        uploaded.append({
            'url': full_url,
            'publicId': f"uploads/{filename}",
            'type': 'video' if content_type.startswith('video') else 'image'
        })

    return Response({'success': True, 'files': uploaded})
