
import { Dentist } from "@/types/dentist";

export const mockDentists: Dentist[] = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    specialty: "General Dentistry",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    address: "123 Main Street",
    city: "Boston",
    state: "MA",
    zipCode: "02115",
    phoneNumber: "(617) 555-1234",
    email: "sarah.johnson@dentalsmile.com",
    bio: "Dr. Sarah Johnson is a compassionate general dentist with over 10 years of experience. She specializes in preventative care and is dedicated to creating a relaxing environment for her patients.",
    education: [
      "DMD, Harvard School of Dental Medicine",
      "BS in Biology, Boston University"
    ],
    certifications: [
      "American Dental Association (ADA)",
      "Massachusetts Dental Society"
    ],
    services: [
      "Routine Check-ups",
      "Teeth Cleaning",
      "Fillings",
      "Crowns",
      "Bridges"
    ],
    languages: ["English", "Spanish"],
    experience: 10,
    rating: 4.8,
    reviewCount: 152,
    availability: "Mon-Fri, 9AM-5PM",
    acceptingNewPatients: true,
    insuranceAccepted: ["Delta Dental", "BlueCross", "Cigna", "Aetna"]
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Chen",
    specialty: "Orthodontics",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80",
    address: "456 Oak Avenue",
    city: "Chicago",
    state: "IL",
    zipCode: "60611",
    phoneNumber: "(312) 555-6789",
    email: "michael.chen@dentalsmile.com",
    bio: "Dr. Michael Chen is a board-certified orthodontist specializing in braces and Invisalign treatments. He's known for his gentle approach and attention to detail.",
    education: [
      "DDS, University of Michigan School of Dentistry",
      "MS in Orthodontics, Northwestern University"
    ],
    certifications: [
      "American Association of Orthodontists",
      "Board Certified, American Board of Orthodontics"
    ],
    services: [
      "Traditional Braces",
      "Ceramic Braces",
      "Invisalign",
      "Retainers",
      "Accelerated Orthodontics"
    ],
    languages: ["English", "Mandarin"],
    experience: 8,
    rating: 4.9,
    reviewCount: 128,
    availability: "Tue-Sat, 8AM-4PM",
    acceptingNewPatients: true,
    insuranceAccepted: ["Delta Dental", "MetLife", "Cigna", "Guardian"]
  },
  {
    id: 3,
    firstName: "James",
    lastName: "Wilson",
    specialty: "Pediatric Dentistry",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    address: "789 Elm Street",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    phoneNumber: "(206) 555-4321",
    email: "james.wilson@dentalsmile.com",
    bio: "Dr. James Wilson is a pediatric dentist who loves working with children. His office is designed to make dental visits fun and stress-free for young patients.",
    education: [
      "DDS, University of Washington School of Dentistry",
      "Residency in Pediatric Dentistry, Seattle Children's Hospital"
    ],
    certifications: [
      "American Academy of Pediatric Dentistry",
      "Washington State Dental Association"
    ],
    services: [
      "Child Dental Exams",
      "Gentle Cleanings",
      "Sealants",
      "Fluoride Treatments",
      "Space Maintainers",
      "Education on Oral Hygiene"
    ],
    languages: ["English"],
    experience: 12,
    rating: 4.7,
    reviewCount: 219,
    availability: "Mon-Thu, 9AM-6PM",
    acceptingNewPatients: true,
    insuranceAccepted: ["Delta Dental", "BlueCross", "United Healthcare", "Principal"]
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Garcia",
    specialty: "Cosmetic Dentistry",
    image: "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1541&q=80",
    address: "321 Pine Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90024",
    phoneNumber: "(213) 555-8765",
    email: "emily.garcia@dentalsmile.com",
    bio: "Dr. Emily Garcia is passionate about transforming smiles through cosmetic dentistry. She combines artistry with advanced techniques to help patients achieve their dream smile.",
    education: [
      "DDS, UCLA School of Dentistry",
      "Advanced Training in Cosmetic Dentistry, Las Vegas Institute"
    ],
    certifications: [
      "American Academy of Cosmetic Dentistry",
      "California Dental Association"
    ],
    services: [
      "Teeth Whitening",
      "Porcelain Veneers",
      "Dental Bonding",
      "Smile Makeovers",
      "Gum Contouring"
    ],
    languages: ["English", "Spanish"],
    experience: 9,
    rating: 4.9,
    reviewCount: 183,
    availability: "Wed-Sun, 10AM-7PM",
    acceptingNewPatients: true,
    insuranceAccepted: ["Delta Dental", "Cigna", "MetLife", "Humana"]
  },
  {
    id: 5,
    firstName: "Robert",
    lastName: "Taylor",
    specialty: "Endodontics",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    address: "555 Maple Drive",
    city: "Denver",
    state: "CO",
    zipCode: "80202",
    phoneNumber: "(303) 555-5678",
    email: "robert.taylor@dentalsmile.com",
    bio: "Dr. Robert Taylor is an endodontist specializing in root canal treatment. He utilizes the latest technology to ensure procedures are as comfortable and efficient as possible.",
    education: [
      "DDS, University of Colorado School of Dental Medicine",
      "Endodontic Residency, University of Pennsylvania"
    ],
    certifications: [
      "American Association of Endodontists",
      "Colorado Dental Association"
    ],
    services: [
      "Root Canal Therapy",
      "Endodontic Retreatment",
      "Endodontic Surgery",
      "Cracked Teeth Treatment",
      "Internal Bleaching"
    ],
    languages: ["English"],
    experience: 15,
    rating: 4.6,
    reviewCount: 97,
    availability: "Mon-Wed & Fri, 8AM-5PM",
    acceptingNewPatients: true,
    insuranceAccepted: ["Delta Dental", "Aetna", "Guardian", "Principal"]
  },
  {
    id: 6,
    firstName: "Olivia",
    lastName: "Martinez",
    specialty: "Periodontics",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    address: "987 Cedar Lane",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    phoneNumber: "(512) 555-9012",
    email: "olivia.martinez@dentalsmile.com",
    bio: "Dr. Olivia Martinez is a periodontist specializing in gum disease treatment and dental implants. She is committed to helping patients maintain healthy gums and preserve their natural teeth.",
    education: [
      "DDS, University of Texas School of Dentistry",
      "MS in Periodontics, Baylor College of Dentistry"
    ],
    certifications: [
      "American Academy of Periodontology",
      "Texas Dental Association"
    ],
    services: [
      "Scaling and Root Planing",
      "Gum Grafting",
      "Dental Implants",
      "Pocket Reduction Surgery",
      "Crown Lengthening"
    ],
    languages: ["English", "Spanish"],
    experience: 11,
    rating: 4.7,
    reviewCount: 118,
    availability: "Mon, Tue, Thu, Fri, 9AM-5PM",
    acceptingNewPatients: true,
    insuranceAccepted: ["Delta Dental", "BlueCross", "Aetna", "MetLife"]
  }
];
