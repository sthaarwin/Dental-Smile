from rest_framework import serializers
from django.contrib.auth import get_user_model
import uuid

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'name', 'phone', 'address', 
                 'emergency_contact', 'emergency_phone', 'password')
        extra_kwargs = {
            'email': {'required': False},  # Make email optional for updates
        }

    def create(self, validated_data):
        email = validated_data.get('email')
        
        # Generate username from email
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        
        # Ensure unique username
        User = get_user_model()
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Create user with password
        password = validated_data.pop('password')
        validated_data['username'] = username
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            **validated_data
        )
        return user

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
