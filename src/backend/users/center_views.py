from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import RecyclingCenter


@api_view(['GET'])
@permission_classes([AllowAny])
def list_centers(request):
    """
    Public endpoint that returns all recycling centers.
    Optional query param: ?type=Phones to filter by type.
    """
    filter_type = request.query_params.get('type', '').strip()
    centers = RecyclingCenter.objects.all()

    result = []
    for c in centers:
        types_list = c.get_types_list()
        if filter_type and filter_type not in types_list:
            continue
        result.append({
            'id': c.id,
            'name': c.name,
            'address': c.address,
            'phone': c.phone,
            'lat': c.lat,
            'lng': c.lng,
            'rating': c.rating,
            'open_now': c.open_now,
            'types': types_list,
        })

    return Response(result)
