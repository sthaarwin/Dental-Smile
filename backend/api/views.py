from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
import logging
import os
import time

logger = logging.getLogger(__name__)

@api_view(['GET'])
def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        data = request.data.copy()  # Make a mutable copy
        email = data.get('email')
        
        # Add detailed logging
        logger.info(f"Register attempt with data: {data}")
        
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # IMPORTANT: Convert phone to phone_number if it exists
        if 'phone' in data:
            data['phone_number'] = data.pop('phone')
        
        # Remove any fields that aren't in the model
        allowed_fields = ['name', 'email', 'password', 'username', 'phone_number']
        filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        logger.info(f"Filtered registration data: {filtered_data}")
        
        serializer = UserSerializer(data=filtered_data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        logger.error(f"Registration validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        logger.info(f"Login attempt for email: {email}")
        
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                serialized_user = UserSerializer(user).data
                return Response({
                    'token': str(refresh.access_token),
                    'user': serialized_user
                })
            logger.error(f"Invalid password for user: {email}")
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except User.DoesNotExist:
            logger.error(f"User not found with email: {email}")
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Login failed', 'detail': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_current_user(request):
    try:
        user = request.user
        return Response(UserSerializer(user).data)
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_profile(request):
    try:
        user = request.user
        # Log the received data for debugging
        logger.info(f"Profile update request data: {request.data}")
        
        # Make a copy of the data that we can modify
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Completely remove profile_picture field from the update data
        # We'll handle profile picture uploads separately
        if 'profile_picture' in data:
            logger.info("Removing profile_picture from update data - use dedicated endpoint instead")
            data.pop('profile_picture')
        
        # Map frontend field names to backend field names
        update_data = {
            'name': data.get('name'),
            'email': data.get('email'),
            'phone_number': data.get('phone_number'),  
            'address': data.get('address'),
            'emergency_contact': data.get('emergency_contact'),
        }
        
        # Filter out None values but keep empty strings
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        logger.info(f"Cleaned update data: {update_data}")
        
        serializer = UserSerializer(user, data=update_data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            
            # Make sure the serialized response includes the updated fields
            response_data = UserSerializer(updated_user).data
            logger.info(f"Updated user data: {response_data}")
            return Response(response_data)
            
        logger.error(f"Profile update validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to update profile', 'detail': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    try:
        email = request.data.get('email')
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_mail(
                'Password Reset Request',
                f'Click this link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'Password reset email sent'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        return Response(
            {'error': 'Failed to process reset request'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    try:
        token = request.data.get('token')
        password = request.data.get('password')
        User = get_user_model()
        
        try:
            user = User.objects.get(password_reset_token=token)
            user.set_password(password)
            user.password_reset_token = None
            user.save()
            
            return Response({'message': 'Password reset successful'})
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired reset token'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return Response(
            {'error': 'Failed to reset password'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    """
    Upload a profile picture for the current user.
    """
    try:
        if 'image' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        image = request.FILES['image']
        
        # Validate file size and type
        if image.size > 2 * 1024 * 1024:  # 2MB limit
            return Response({'error': 'Image size should be less than 2MB'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not image.name.lower().endswith(('.jpg', '.jpeg', '.png')):
            return Response({'error': 'Only JPG and PNG files are allowed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # In production, save to S3 or similar storage service
        # For now, save to media directory
        user = request.user
        filename = f"profile_{user.id}_{int(time.time())}{os.path.splitext(image.name)[1]}"
        filepath = os.path.join(settings.MEDIA_ROOT, 'profile_pictures', filename)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save the file
        with open(filepath, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)
        
        # Create URL for the image
        image_url = f"{settings.MEDIA_URL}profile_pictures/{filename}"
        
        # Update user model
        user.profile_picture = image_url
        user.save()
        
        return Response({'imageUrl': image_url}, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Error uploading profile picture: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to upload profile picture'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )