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
  
  // Use both ID and name for better URL structure
  const profileUrl = `/dentist/${dentist.id}/${dentistUrlName}`;
  const bookingUrl = `/book/${dentist.id}`;

  const handleCardClick = () => {
    navigate(profileUrl);
  };
  
  // Format business hours from object format if needed
  const formatAvailability = () => {
    // Check if availability is a string or object
    if (typeof dentist.availability === 'string') {
      return dentist.availability;
    }
    
    // If it's an object (new format), format it as a readable string
    if (dentist.availability && typeof dentist.availability === 'object') {
      try {
        const businessHours = dentist.availability;
        const daysOpen = [];
        
        // Loop through each day
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayAbbreviations = {
          'monday': 'Mon',
          'tuesday': 'Tue',
          'wednesday': 'Wed',
          'thursday': 'Thu',
          'friday': 'Fri',
          'saturday': 'Sat',
          'sunday': 'Sun'
        };
        
        // Group consecutive days with same hours
        let currentGroup = null;
        let lastDay = null;
        
        days.forEach(day => {
          const dayData = businessHours[day];
          
          if (!dayData || !dayData.isOpen) return;
          
          const hours = `${dayData.open}-${dayData.close}`;
          
          if (!currentGroup) {
            // Start new group
            currentGroup = { days: [day], hours };
          } else if (currentGroup.hours === hours && lastDay && days.indexOf(lastDay) === days.indexOf(day) - 1) {
            // Add to current group if hours match and days are consecutive
            currentGroup.days.push(day);
          } else {
            // If not consecutive or hours differ, finish group and start new one
            daysOpen.push(formatGroup(currentGroup, dayAbbreviations));
            currentGroup = { days: [day], hours };
          }
          
          lastDay = day;
        });
        
        // Add the last group
        if (currentGroup) {
          daysOpen.push(formatGroup(currentGroup, dayAbbreviations));
        }
        
        return daysOpen.length ? daysOpen.join(', ') : 'Hours not specified';
      } catch (error) {
        console.error('Error formatting availability:', error);
        return 'Hours not specified';
      }
    }
    
    return 'Hours not specified';
  };

  // Helper function to format a group of days
  const formatGroup = (group, abbreviations) => {
    if (group.days.length === 1) {
      return `${abbreviations[group.days[0]]}, ${formatTimeRange(group.hours)}`;
    }
    
    const firstDay = abbreviations[group.days[0]];
    const lastDay = abbreviations[group.days[group.days.length - 1]];
    return `${firstDay} to ${lastDay}, ${formatTimeRange(group.hours)}`;
  };

  // Helper function to format time range in a nice format
  const formatTimeRange = (timeRange) => {
    const [start, end] = timeRange.split('-');
    
    // Handle case where hours might be in 24h format
    if (start && end) {
      try {
        const formatTime = (time) => {
          // Convert 24h format to 12h with proper formatting
          if (time.includes(':')) {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours, 10);
            if (hour < 12) {
              return hour === 0 ? `12${minutes === '00' ? '' : `:${minutes}`} AM` : `${hour}${minutes === '00' ? '' : `:${minutes}`} AM`;
            } else {
              return hour === 12 ? `12${minutes === '00' ? '' : `:${minutes}`} PM` : `${hour - 12}${minutes === '00' ? '' : `:${minutes}`} PM`;
            }
          }
          return time;
        };
        
        return `${formatTime(start)} - ${formatTime(end)}`;
      } catch (e) {
        return timeRange;
      }
    }
    
    return timeRange;
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
              {dentist.rating > 0 ? (
                <>
                  <Star className="h-4 w-4 text-yellow-400 mr-1 flex-shrink-0" />
                  <span className="font-semibold">{dentist.rating}</span>
                  <span className="mx-1 text-sm text-gray-300">•</span>
                  <span className="text-sm">{dentist.reviewCount} reviews</span>
                </>
              ) : (
                <span className="bg-dentist-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  New Dentist
                </span>
              )}
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
            <span className="text-sm text-gray-600">{formatAvailability()}</span>
          </div>
          
          {dentist.experience && (
            <div className="flex items-center mb-3">
              <Award className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
              <span className="text-sm text-gray-600">{dentist.experience} years experience</span>
            </div>
          )}
          
          <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
            <Link to={profileUrl}>
              <Button variant="outline" className="w-full mb-2">
                View Profile
              </Button>
            </Link>
            <Button className="w-full" asChild>
              <Link to={bookingUrl}>
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