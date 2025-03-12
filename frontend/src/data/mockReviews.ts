
import { Review } from "@/types/review";

export const mockReviews: Review[] = [
  {
    id: 1,
    dentistId: 1,
    patientId: 101,
    patientName: "Amanda Thompson",
    rating: 5,
    comment: "Dr. Johnson is amazing! She was very thorough and took the time to explain everything to me. The staff was also very friendly and the office was clean and modern.",
    date: "2023-11-15",
    procedure: "Routine Cleaning"
  },
  {
    id: 2,
    dentistId: 1,
    patientId: 102,
    patientName: "David Wilson",
    rating: 4,
    comment: "Good experience overall. Dr. Johnson was professional and knowledgeable. The only reason I'm not giving 5 stars is because I had to wait a bit longer than expected.",
    date: "2023-10-22",
    procedure: "Filling"
  },
  {
    id: 3,
    dentistId: 2,
    patientId: 103,
    patientName: "Jessica Brown",
    rating: 5,
    comment: "Dr. Chen is the best orthodontist I've ever had! He was very patient with all my questions and made sure I was comfortable throughout the entire process. My braces are off now and my teeth look perfect!",
    date: "2023-11-05",
    procedure: "Braces Removal"
  },
  {
    id: 4,
    dentistId: 2,
    patientId: 104,
    patientName: "Michael Davis",
    rating: 5,
    comment: "I was nervous about getting Invisalign, but Dr. Chen made the whole process so easy. He explained each step thoroughly and was always available to answer my questions. Highly recommend!",
    date: "2023-09-30",
    procedure: "Invisalign Consultation"
  },
  {
    id: 5,
    dentistId: 3,
    patientId: 105,
    patientName: "Sarah Miller",
    rating: 5,
    comment: "My son was terrified of going to the dentist, but Dr. Wilson completely changed that! His office is kid-friendly and he has such a gentle approach. My son now looks forward to his dental visits!",
    date: "2023-11-10",
    procedure: "Pediatric Check-up"
  },
  {
    id: 6,
    dentistId: 3,
    patientId: 106,
    patientName: "Robert Johnson",
    rating: 4,
    comment: "Dr. Wilson is great with kids. My daughter had a cavity filled and she didn't cry once. The office has games and toys which makes the wait enjoyable for children.",
    date: "2023-10-15",
    procedure: "Filling"
  },
  {
    id: 7,
    dentistId: 4,
    patientId: 107,
    patientName: "Jennifer Lopez",
    rating: 5,
    comment: "I got veneers with Dr. Garcia and I couldn't be happier with the results! She understood exactly what I wanted and delivered beyond my expectations. My smile looks natural and beautiful.",
    date: "2023-11-08",
    procedure: "Porcelain Veneers"
  },
  {
    id: 8,
    dentistId: 4,
    patientId: 108,
    patientName: "Thomas Wright",
    rating: 5,
    comment: "Dr. Garcia transformed my smile with cosmetic bonding. She's a true artist! The procedure was quick and painless, and the results are stunning. Worth every penny.",
    date: "2023-10-05",
    procedure: "Dental Bonding"
  },
  {
    id: 9,
    dentistId: 5,
    patientId: 109,
    patientName: "Linda Martinez",
    rating: 4,
    comment: "I had a root canal done by Dr. Taylor. It was surprisingly painless! He was very skilled and made sure I was comfortable throughout the procedure. The only downside was that the appointment ran a bit late.",
    date: "2023-11-12",
    procedure: "Root Canal"
  },
  {
    id: 10,
    dentistId: 5,
    patientId: 110,
    patientName: "Kevin Anderson",
    rating: 5,
    comment: "Dr. Taylor saved my tooth! I was in extreme pain and he fit me in for an emergency appointment. He was calm, professional, and efficient. I'm so grateful for his expertise.",
    date: "2023-09-28",
    procedure: "Emergency Root Canal"
  },
  {
    id: 11,
    dentistId: 6,
    patientId: 111,
    patientName: "Elizabeth Clark",
    rating: 5,
    comment: "Dr. Martinez is wonderful! I've been dealing with gum disease for years, and she's the first dentist who has really helped me improve my gum health. Her treatment plan was comprehensive and effective.",
    date: "2023-11-01",
    procedure: "Scaling and Root Planing"
  },
  {
    id: 12,
    dentistId: 6,
    patientId: 112,
    patientName: "William Turner",
    rating: 4,
    comment: "I got a dental implant with Dr. Martinez and I'm very satisfied with the result. The procedure took longer than expected, but the quality of care was excellent. She followed up with me multiple times afterward to make sure everything was healing properly.",
    date: "2023-10-18",
    procedure: "Dental Implant"
  }
];
