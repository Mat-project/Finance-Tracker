from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, LoginSerializer, UserProfileSerializer, UserSettingsSerializer
from rest_framework import generics, permissions

User = get_user_model()

def get_tokens_for_user(user):
    """Generate JWT tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    identifier = request.data.get("identifier")  # This can be email or username
    password = request.data.get("password")

    try:
        # Check if identifier is an email
        if "@" in identifier:
            user = User.objects.get(email=identifier)
        else:
            user = User.objects.get(username=identifier)

        user = authenticate(username=user.username, password=password)

        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserProfileSerializer(user).data
            })
        else:
            return Response({"error": "Invalid credentials"}, status=400)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        jwt_tokens = get_tokens_for_user(user)

        return Response({
            'token': token.key,
            'jwt': jwt_tokens,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def profile_view(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        try:
            print("=== Profile Update Debug ===")
            print("Raw data:", request.data)
            print("Files:", request.FILES)
            print("Content-Type:", request.content_type)
            
            # Handle both form-data and JSON
            data = request.data.copy()
            
            # Handle profile picture
            if 'profile_picture' in request.FILES:
                # Delete old profile picture if it exists
                if request.user.profile_picture:
                    try:
                        request.user.profile_picture.delete(save=False)
                    except Exception as e:
                        print(f"Error deleting old profile picture: {e}")
                data['profile_picture'] = request.FILES['profile_picture']
            elif 'remove_profile_picture' in data and data['remove_profile_picture'].lower() == 'true':
                # Delete the profile picture if it exists
                if request.user.profile_picture:
                    try:
                        request.user.profile_picture.delete(save=False)
                    except Exception as e:
                        print(f"Error deleting profile picture: {e}")
                data['profile_picture'] = None
            
            # Remove empty strings and None values
            data = {k: v for k, v in data.items() if v not in [None, '', 'null', 'undefined']}
            
            # Convert string booleans to actual booleans
            boolean_fields = ['email_notifications']
            for field in boolean_fields:
                if field in data:
                    data[field] = str(data[field]).lower() == 'true'
            
            print("Processed data:", data)
            
            serializer = UserSerializer(request.user, data=data, partial=True)
            
            if serializer.is_valid():
                print("Serializer is valid")
                user = serializer.save()
                return Response(UserProfileSerializer(user).data)
            else:
                print("Validation errors:", serializer.errors)
                return Response({
                    "error": "Validation failed",
                    "details": serializer.errors,
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            import traceback
            print("Exception in profile update:", str(e))
            print("Traceback:", traceback.format_exc())
            return Response({
                "error": "Server error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserSettingsView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSettingsSerializer
    
    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
