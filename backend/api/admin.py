from django.contrib import admin
from .models import Dentist, Appointment, Review

admin.site.register(Dentist)
admin.site.register(Appointment)
admin.site.register(Review)
