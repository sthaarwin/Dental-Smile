
import { Star } from "lucide-react";
import { format } from "date-fns";
import { Review } from "@/types/review";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  // Calculate star rating display
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 rounded-full bg-dentist-100 flex items-center justify-center text-dentist-600 font-semibold mr-3">
          {review.patientName.charAt(0)}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{review.patientName}</h4>
          <p className="text-xs text-gray-500">
            {format(new Date(review.date), "MMMM d, yyyy")}
          </p>
        </div>
      </div>
      
      <div className="flex mb-3">{renderStars()}</div>
      
      {review.procedure && (
        <p className="text-sm font-medium text-dentist-600 mb-2">
          Procedure: {review.procedure}
        </p>
      )}
      
      <p className="text-gray-700 text-sm">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
