import random

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# Simulated AI models response
DEVICE_TEMPLATES = [
    {
        "type": "Smartphone",
        "category": "Mobile Device",
        "instructions": [
            "Wipe all personal data",
            "Remove battery if possible",
            "Drop off at a certified center to earn 80 points"
        ],
        "points": 80
    },
    {
        "type": "Laptop",
        "category": "Computing Device",
        "instructions": [
            "Back up and wipe your hard drive",
            "Disconnect power adapter",
            "Bring to an e-waste facility to earn 150 points"
        ],
        "points": 150
    },
    {
        "type": "Battery Pack",
        "category": "Power Storage",
        "instructions": [
            "Never puncture or dismantle",
            "Use specialized battery drop-off bins",
            "Highly toxic: Handle with care! Earn 60 points"
        ],
        "points": 60
    },
    {
        "type": "Television",
        "category": "Display Device",
        "instructions": [
            "Check for manufacturer take-back programs",
            "Never smash or break the screen (contains lead/mercury)",
            "Schedule a pickup to earn 120 points"
        ],
        "points": 120
    }
]

@api_view(['POST'])
@permission_classes([AllowAny])
def detect_device(request):
    """
    Accepts an uploaded image of e-waste and returns a simplified AI prediction
    of the device type and short recycling instructions.
    """
    if 'image' not in request.FILES:
        return Response({"error": "No image uploaded. Please provide an image."}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    
    # In a real app, you would pass `image_file` to a PyTorch/TensorFlow ML Model here.
    # For now, we will simulate the AI by randomly picking a device type based
    # on the length of the filename just to have some predictability.
    
    file_length = len(image_file.name)
    predicted_device = DEVICE_TEMPLATES[file_length % len(DEVICE_TEMPLATES)]
    
    # Add fake confidence score
    confidence = random.randint(85, 98)

    response_data = {
        "success": True,
        "type": predicted_device["type"],
        "category": predicted_device["category"],
        "confidence": confidence,
        "instructions": predicted_device["instructions"],
        "points": predicted_device["points"]
    }

    return Response(response_data, status=status.HTTP_200_OK)
