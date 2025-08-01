import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { DentalService, DentalServiceDocument } from '../services/schemas/dental-service.schema';
import { Appointment, AppointmentDocument } from '../appointments/schemas/appointment.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { WorkingHours, WorkingHoursDocument } from '../schedules/schemas/working-hours.schema';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DentalService.name) private dentalServiceModel: Model<DentalServiceDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(WorkingHours.name) private workingHoursModel: Model<WorkingHoursDocument>,
  ) {}

  async seedDatabase() {
    console.log('🌱 Starting database seeding...');

    try {
      // Clear existing data
      await this.clearDatabase();

      // Seed data in order
      const users = await this.seedUsers();
      const services = await this.seedServices();
      const workingHours = await this.seedWorkingHours(users);
      const appointments = await this.seedAppointments(users);
      const reviews = await this.seedReviews(users);

      console.log('✅ Database seeding completed successfully!');
      return {
        users: users.length,
        services: services.length,
        appointments: appointments.length,
        reviews: reviews.length,
        workingHours: workingHours.length,
      };
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      this.userModel.deleteMany({}),
      this.dentalServiceModel.deleteMany({}),
      this.appointmentModel.deleteMany({}),
      this.reviewModel.deleteMany({}),
      this.workingHoursModel.deleteMany({}),
    ]);
    console.log('✅ Database cleared');
  }

  private async seedUsers() {
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      // Admin User
      {
        name: 'Admin User',
        email: 'admin@dentalsmile.com',
        password: hashedPassword,
        phone_number: '+1234567890',
        role: 'admin',
        profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      },
      
      // Patient Users
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: hashedPassword,
        phone_number: '+1234567891',
        role: 'patient',
      },
      {
        name: 'Emma Johnson',
        email: 'emma.johnson@email.com',
        password: hashedPassword,
        phone_number: '+1234567892',
        role: 'patient',
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        password: hashedPassword,
        phone_number: '+1234567893',
        role: 'patient',
      },
      {
        name: 'Sarah Davis',
        email: 'sarah.davis@email.com',
        password: hashedPassword,
        phone_number: '+1234567894',
        role: 'patient',
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        password: hashedPassword,
        phone_number: '+1234567895',
        role: 'patient',
      },

      // Dentist Users
      {
        name: 'Dr. Sarah Johnson',
        email: 'dr.sarah@dentalsmile.com',
        password: hashedPassword,
        phone_number: '+1617555234',
        role: 'dentist',
        profile_picture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
        dentist_details: {
          specialties: ['General Dentistry', 'Preventive Care'],
          experience: 10,
          education: 'DMD, Harvard School of Dental Medicine',
          certifications: 'American Dental Association (ADA)',
          license_number: 'DDS123456',
          practice_name: 'Boston Dental Care',
          address: '123 Main Street',
          city: 'Boston',
          state: 'MA',
          zip_code: '02115',
          office_phone: '+1617555234',
          bio: 'Dr. Sarah Johnson is a compassionate general dentist with over 10 years of experience.',
          services: ['Routine Check-ups', 'Teeth Cleaning', 'Fillings', 'Crowns'],
          languages: ['English', 'Spanish'],
          rating: 4.8,
          review_count: 152,
          accepting_new_patients: true,
          accepted_insurance: ['Delta Dental', 'BlueCross', 'Cigna'],
        },
      },
      {
        name: 'Dr. Michael Chen',
        email: 'dr.chen@dentalsmile.com',
        password: hashedPassword,
        phone_number: '+1312555789',
        role: 'dentist',
        profile_picture: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
        dentist_details: {
          specialties: ['Orthodontics'],
          experience: 8,
          education: 'DDS, University of Michigan School of Dentistry',
          certifications: 'American Association of Orthodontists',
          license_number: 'DDS789123',
          practice_name: 'Chicago Orthodontics',
          address: '456 Oak Avenue',
          city: 'Chicago',
          state: 'IL',
          zip_code: '60611',
          office_phone: '+1312555789',
          bio: 'Dr. Michael Chen is a board-certified orthodontist specializing in braces and Invisalign.',
          services: ['Traditional Braces', 'Invisalign', 'Retainers'],
          languages: ['English', 'Mandarin'],
          rating: 4.9,
          review_count: 128,
          accepting_new_patients: true,
          accepted_insurance: ['Delta Dental', 'MetLife', 'Cigna'],
        },
      },
      {
        name: 'Dr. Emily Garcia',
        email: 'dr.garcia@dentalsmile.com',
        password: hashedPassword,
        phone_number: '+1213555876',
        role: 'dentist',
        profile_picture: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=400',
        dentist_details: {
          specialties: ['Cosmetic Dentistry'],
          experience: 9,
          education: 'DDS, UCLA School of Dentistry',
          certifications: 'American Academy of Cosmetic Dentistry',
          license_number: 'DDS456789',
          practice_name: 'LA Cosmetic Dental',
          address: '321 Pine Street',
          city: 'Los Angeles',
          state: 'CA',
          zip_code: '90024',
          office_phone: '+1213555876',
          bio: 'Dr. Emily Garcia is passionate about transforming smiles through cosmetic dentistry.',
          services: ['Teeth Whitening', 'Porcelain Veneers', 'Smile Makeovers'],
          languages: ['English', 'Spanish'],
          rating: 4.9,
          review_count: 183,
          accepting_new_patients: true,
          accepted_insurance: ['Delta Dental', 'Cigna', 'MetLife'],
        },
      },
      {
        name: 'Dr. James Wilson',
        email: 'dr.wilson@dentalsmile.com',
        password: hashedPassword,
        phone_number: '+1206555432',
        role: 'dentist',
        profile_picture: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
        dentist_details: {
          specialties: ['Pediatric Dentistry'],
          experience: 12,
          education: 'DDS, University of Washington School of Dentistry',
          certifications: 'American Academy of Pediatric Dentistry',
          license_number: 'DDS321654',
          practice_name: 'Seattle Kids Dental',
          address: '789 Elm Street',
          city: 'Seattle',
          state: 'WA',
          zip_code: '98101',
          office_phone: '+1206555432',
          bio: 'Dr. James Wilson is a pediatric dentist who loves working with children.',
          services: ['Child Dental Exams', 'Gentle Cleanings', 'Sealants', 'Fluoride Treatments'],
          languages: ['English'],
          rating: 4.7,
          review_count: 219,
          accepting_new_patients: true,
          accepted_insurance: ['Delta Dental', 'BlueCross', 'United Healthcare'],
        },
      },
    ];

    const users = await this.userModel.insertMany(usersData);
    console.log(`✅ Seeded ${users.length} users`);
    return users;
  }

  private async seedServices() {
    console.log('🦷 Seeding dental services...');
    
    const servicesData = [
      {
        name: 'General Check-up',
        description: 'Comprehensive dental examination including cleaning and oral health assessment',
        duration: 60,
        price: 150,
        category: 'general',
        isActive: true,
      },
      {
        name: 'Teeth Cleaning',
        description: 'Professional dental cleaning to remove plaque and tartar',
        duration: 45,
        price: 120,
        category: 'preventive',
        isActive: true,
      },
      {
        name: 'Teeth Whitening',
        description: 'Professional teeth whitening treatment for a brighter smile',
        duration: 90,
        price: 400,
        category: 'cosmetic',
        isActive: true,
      },
      {
        name: 'Dental Filling',
        description: 'Tooth-colored composite filling for cavities',
        duration: 45,
        price: 200,
        category: 'general',
        isActive: true,
      },
      {
        name: 'Root Canal',
        description: 'Endodontic treatment to save infected or damaged tooth',
        duration: 120,
        price: 800,
        category: 'general',
        isActive: true,
      },
      {
        name: 'Dental Crown',
        description: 'Porcelain crown to restore damaged tooth',
        duration: 90,
        price: 1200,
        category: 'general',
        isActive: true,
      },
      {
        name: 'Invisalign Consultation',
        description: 'Initial consultation for clear aligner treatment',
        duration: 60,
        price: 100,
        category: 'orthodontic',
        isActive: true,
      },
      {
        name: 'Dental Implant',
        description: 'Titanium implant to replace missing tooth',
        duration: 180,
        price: 3000,
        category: 'surgical',
        isActive: true,
      },
      {
        name: 'Pediatric Cleaning',
        description: 'Gentle cleaning for children under 12',
        duration: 30,
        price: 80,
        category: 'pediatric',
        isActive: true,
      },
      {
        name: 'Porcelain Veneers',
        description: 'Custom porcelain veneers for smile makeover',
        duration: 120,
        price: 1500,
        category: 'cosmetic',
        isActive: true,
      },
    ];

    const services = await this.dentalServiceModel.insertMany(servicesData);
    console.log(`✅ Seeded ${services.length} dental services`);
    return services;
  }

  private async seedWorkingHours(users: any[]) {
    console.log('⏰ Seeding working hours...');
    
    const dentists = users.filter(user => user.role === 'dentist');
    const workingHoursData: any[] = [];

    for (const dentist of dentists) {
      workingHoursData.push({
        dentist: dentist._id,
        monday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        tuesday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        wednesday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        thursday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        friday: { isWorking: true, startTime: '09:00 AM', endTime: '05:00 PM' },
        saturday: { isWorking: false, startTime: '', endTime: '' },
        sunday: { isWorking: false, startTime: '', endTime: '' },
        daysOff: [],
        mondaySlots: [
          { id: Date.now() + Math.random(), startTime: '09:00 AM', endTime: '10:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '10:00 AM', endTime: '11:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '11:00 AM', endTime: '12:00 PM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '02:00 PM', endTime: '03:00 PM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '03:00 PM', endTime: '04:00 PM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '04:00 PM', endTime: '05:00 PM', isAvailable: true },
        ],
        tuesdaySlots: [
          { id: Date.now() + Math.random(), startTime: '09:00 AM', endTime: '10:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '10:00 AM', endTime: '11:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '02:00 PM', endTime: '03:00 PM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '03:00 PM', endTime: '04:00 PM', isAvailable: true },
        ],
        wednesdaySlots: [
          { id: Date.now() + Math.random(), startTime: '09:00 AM', endTime: '10:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '11:00 AM', endTime: '12:00 PM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '02:00 PM', endTime: '03:00 PM', isAvailable: true },
        ],
        thursdaySlots: [
          { id: Date.now() + Math.random(), startTime: '09:00 AM', endTime: '10:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '10:00 AM', endTime: '11:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '03:00 PM', endTime: '04:00 PM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '04:00 PM', endTime: '05:00 PM', isAvailable: true },
        ],
        fridaySlots: [
          { id: Date.now() + Math.random(), startTime: '09:00 AM', endTime: '10:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '10:00 AM', endTime: '11:00 AM', isAvailable: true },
          { id: Date.now() + Math.random(), startTime: '11:00 AM', endTime: '12:00 PM', isAvailable: true },
        ],
        saturdaySlots: [],
        sundaySlots: [],
      });
    }

    const workingHours = await this.workingHoursModel.insertMany(workingHoursData);
    console.log(`✅ Seeded ${workingHours.length} working hours schedules`);
    return workingHours;
  }

  private async seedAppointments(users: any[]) {
    console.log('📅 Seeding appointments...');
    
    const patients = users.filter(user => user.role === 'patient');
    const dentists = users.filter(user => user.role === 'dentist');
    
    const appointmentsData = [
      {
        patient: patients[0]._id,
        dentist: dentists[0]._id,
        date: new Date('2025-08-15'),
        startTime: '9:00 AM',
        endTime: '10:00 AM',
        service: 'General Check-up',
        status: 'scheduled',
        notes: 'First visit - routine examination',
      },
      {
        patient: patients[1]._id,
        dentist: dentists[1]._id,
        date: new Date('2025-08-16'),
        startTime: '2:00 PM',
        endTime: '3:00 PM',
        service: 'Invisalign Consultation',
        status: 'scheduled',
        notes: 'Interested in clear aligners for teeth straightening',
      },
      {
        patient: patients[2]._id,
        dentist: dentists[2]._id,
        date: new Date('2025-08-17'),
        startTime: '10:30 AM',
        endTime: '12:00 PM',
        service: 'Teeth Whitening',
        status: 'scheduled',
        notes: 'Wedding preparation - wants brighter smile',
      },
      {
        patient: patients[3]._id,
        dentist: dentists[0]._id,
        date: new Date('2025-08-18'),
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        service: 'Teeth Cleaning',
        status: 'scheduled',
        notes: 'Regular 6-month cleaning',
      },
      {
        patient: patients[4]._id,
        dentist: dentists[3]._id,
        date: new Date('2025-08-19'),
        startTime: '3:00 PM',
        endTime: '4:00 PM',
        service: 'Pediatric Cleaning',
        status: 'scheduled',
        notes: 'Child patient - first dental visit',
      },
      {
        patient: patients[0]._id,
        dentist: dentists[2]._id,
        date: new Date('2025-07-20'),
        startTime: '2:00 PM',
        endTime: '3:30 PM',
        service: 'Porcelain Veneers',
        status: 'completed',
        notes: 'Veneers consultation completed successfully',
      },
      {
        patient: patients[1]._id,
        dentist: dentists[0]._id,
        date: new Date('2025-07-15'),
        startTime: '9:00 AM',
        endTime: '10:30 AM',
        service: 'Dental Filling',
        status: 'completed',
        notes: 'Filled cavity in upper molar',
      },
    ];

    const appointments = await this.appointmentModel.insertMany(appointmentsData);
    console.log(`✅ Seeded ${appointments.length} appointments`);
    return appointments;
  }

  private async seedReviews(users: any[]) {
    console.log('⭐ Seeding reviews...');
    
    const patients = users.filter(user => user.role === 'patient');
    const dentists = users.filter(user => user.role === 'dentist');
    
    const reviewsData = [
      {
        patient: patients[0]._id,
        dentist: dentists[0]._id,
        rating: 5,
        comment: 'Excellent service! Dr. Johnson was very gentle and professional. The office staff was friendly and accommodating. I highly recommend this practice.',
        procedure: 'General Check-up',
        isVisible: true,
        response: 'Thank you for the wonderful review! We are thrilled you had such a positive experience.',
        responseDate: new Date('2025-07-25'),
      },
      {
        patient: patients[1]._id,
        dentist: dentists[1]._id,
        rating: 4,
        comment: 'Great orthodontist! Dr. Chen explained the Invisalign process clearly and answered all my questions. Looking forward to starting treatment.',
        procedure: 'Invisalign Consultation',
        isVisible: true,
        response: 'Thank you for the kind words! We are excited to help you achieve your perfect smile.',
        responseDate: new Date('2025-08-02'),
      },
      {
        patient: patients[2]._id,
        dentist: dentists[2]._id,
        rating: 5,
        comment: 'Amazing results! My teeth are several shades whiter. Dr. Garcia is truly an artist and made me feel comfortable throughout the procedure.',
        procedure: 'Teeth Whitening',
        isVisible: true,
        response: null,
        responseDate: null,
      },
      {
        patient: patients[3]._id,
        dentist: dentists[0]._id,
        rating: 5,
        comment: 'Best dental cleaning I have ever had! Very thorough and gentle. The office is modern and clean. Will definitely be back.',
        procedure: 'Teeth Cleaning',
        isVisible: true,
        response: null,
        responseDate: null,
      },
      {
        patient: patients[4]._id,
        dentist: dentists[3]._id,
        rating: 5,
        comment: 'Dr. Wilson is fantastic with kids! My son was nervous but Dr. Wilson made him feel at ease. Great pediatric dentist.',
        procedure: 'Pediatric Cleaning',
        isVisible: true,
        response: 'Thank you! We love making dental visits fun and comfortable for our young patients.',
        responseDate: new Date('2025-08-01'),
      },
      {
        patient: patients[0]._id,
        dentist: dentists[2]._id,
        rating: 4,
        comment: 'Very satisfied with my veneers consultation. Dr. Garcia provided detailed information about the process and costs.',
        procedure: 'Porcelain Veneers',
        isVisible: true,
        response: null,
        responseDate: null,
      },
      {
        patient: patients[1]._id,
        dentist: dentists[0]._id,
        rating: 5,
        comment: 'Quick and painless filling! Dr. Johnson did an excellent job and the filling looks natural.',
        procedure: 'Dental Filling',
        isVisible: true,
        response: 'Thank you! We strive to make all procedures as comfortable as possible.',
        responseDate: new Date('2025-07-20'),
      },
    ];

    const reviews = await this.reviewModel.insertMany(reviewsData);
    console.log(`✅ Seeded ${reviews.length} reviews`);
    return reviews;
  }
}