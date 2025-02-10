from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

User = get_user_model()  # ✅ Use the custom user model

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    email = serializers.EmailField(required=False)  # Make email optional for updates
    username = serializers.CharField(required=False)  # Make username optional for updates

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'phone_number', 'profile_picture', 'email_notifications',
            'theme_preference', 'currency_preference'
        )
        read_only_fields = ('id',)
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
            'email_notifications': {'required': False},
            'theme_preference': {'required': False},
            'currency_preference': {'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Handle profile picture separately
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            instance.profile_picture = profile_picture
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'profile_picture', 'theme_preference', 
            'currency_preference', 'email_notifications'
        )
        read_only_fields = ('id', 'username', 'email')

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email_notifications', 'theme_preference', 'currency_preference']
        # Add any other settings fields you need
