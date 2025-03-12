import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dentist } from "@/types/dentist";

interface DentistCardProps {
  dentist: Dentist;
}

const DentistCard = ({ dentist }: DentistCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Create URL-friendly name
  const dentistUrlName = `${dentist.firstName}-${dentist.lastName}`.toLowerCase();

  const handleCardClick = () => {
    navigate(`/dentist/${dentistUrlName}`);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 cursor-pointer ${
        isHovered ? "shadow-lg transform -translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="flex flex-col h-full">
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={dentist.image || "/placeholder.svg"}
            alt={`Dr. ${dentist.firstName} ${dentist.lastName}`}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center text-white">
              <Star className="h-4 w-4 text-yellow-400 mr-1 flex-shrink-0" />
              <span className="font-semibold">{dentist.rating}</span>
              <span className="mx-1 text-sm text-gray-300">•</span>
              <span className="text-sm">{dentist.reviewCount} reviews</span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Dr. {dentist.firstName} {dentist.lastName}
          </h3>
          <p className="text-dentist-600 font-medium mb-2">{dentist.specialty}</p>
          
          <div className="flex items-start mb-2">
            <MapPin className="h-4 w-4 text-gray-500 mr-1 mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-600">{dentist.address}</span>
          </div>
          
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
            <span className="text-sm text-gray-600">{dentist.availability}</span>
          </div>
          
          {dentist.experience && (
            <div className="flex items-center mb-3">
              <Award className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
              <span className="text-sm text-gray-600">{dentist.experience} years experience</span>
            </div>
          )}
          
          <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
            <Link to={`/dentist/${dentistUrlName}`}>
              <Button variant="outline" className="w-full mb-2">
                View Profile
              </Button>
            </Link>
            <Button className="w-full" asChild>
              <Link to={`/book/${dentistUrlName}`}>
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistCard;