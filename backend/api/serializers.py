from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'first_name', 'last_name', 'is_patient', 'is_dentist', 'phone_number')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False}
        }

    def validate_password(self, value):
        return make_password(value)

    def create(self, validated_data):
        if 'username' not in validated_data:
            validated_data['username'] = validated_data['email']
        return User.objects.create(**validated_data)
