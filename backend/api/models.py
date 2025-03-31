from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('phone_number', '0000000000') 

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)
    
class User(AbstractUser):
    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True, default="")
    address = models.CharField(max_length=255, blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    emergency_phone = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    is_patient = models.BooleanField(default=True)
    is_dentist = models.BooleanField(default=False)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager() 

    class Meta:
        db_table = 'api_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email
    
class Dentist(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    image = models.URLField(blank=True, null=True)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    bio = models.TextField()
    education = models.JSONField()  # Store as array
    certifications = models.JSONField()  # Store as array
    services = models.JSONField()  # Store as array
    languages = models.JSONField()  # Store as array
    experience = models.IntegerField()
    rating = models.DecimalField(max_digits=3, decimal_places=2)
    review_count = models.IntegerField(default=0)
    availability = models.CharField(max_length=100)
    accepting_new_patients = models.BooleanField(default=True)
    insurance_accepted = models.JSONField()  # Store as array

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]

    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE)
    patient_id = models.IntegerField()
    patient_name = models.CharField(max_length=200)
    dentist_name = models.CharField(max_length=200)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    reason = models.TextField()
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Appointment for {self.patient_name} with {self.dentist_name}"

class Review(models.Model):
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE)
    patient_id = models.IntegerField()
    patient_name = models.CharField(max_length=200)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    date = models.DateField()
    procedure = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"Review by {self.patient_name} for Dr. {self.dentist.last_name}"
