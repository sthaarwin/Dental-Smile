
import { useState } from "react";
import { Filter, Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dentist } from "@/types/dentist";

interface DentistFilterProps {
  onFilterChange: (filtered: any) => void;
  dentists: Dentist[];
}

const specialties = [
  "General Dentistry",
  "Orthodontics",
  "Pediatric Dentistry",
  "Endodontics",
  "Periodontics",
  "Oral Surgery",
  "Cosmetic Dentistry",
];

const DentistFilter = ({ onFilterChange, dentists }: DentistFilterProps) => {
  const [rating, setRating] = useState([4]);
  const [distance, setDistance] = useState([10]);
  const [availability, setAvailability] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleApplyFilters = () => {
    // Apply filters to dentists array
    const filtered = dentists.filter((dentist) => {
      // Filter by rating
      if (dentist.rating < rating[0]) return false;
      
      // Filter by specialties if any selected
      if (selectedSpecialties.length > 0 && !selectedSpecialties.includes(dentist.specialty)) {
        return false;
      }
      
      // Filter by availability
      if (availability && !dentist.acceptingNewPatients) {
        return false;
      }
      
      return true;
    });
    
    onFilterChange(filtered);
  };

  const handleReset = () => {
    setRating([4]);
    setDistance([10]);
    setAvailability(false);
    setSelectedSpecialties([]);
    onFilterChange(dentists); // Reset to show all dentists
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-400" />
            Minimum Rating
          </h4>
          <div className="px-1">
            <Slider
              value={rating}
              min={1}
              max={5}
              step={1}
              onValueChange={setRating}
            />
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
          <p className="text-sm font-medium text-dentist-600 mt-2">
            {rating[0]}+ Stars
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Distance (miles)</h4>
          <div className="px-1">
            <Slider
              value={distance}
              min={1}
              max={50}
              step={1}
              onValueChange={setDistance}
            />
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>1</span>
              <span>10</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
          <p className="text-sm font-medium text-dentist-600 mt-2">
            Within {distance[0]} miles
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="available-now"
            checked={availability}
            onCheckedChange={setAvailability}
          />
          <Label htmlFor="available-now">Available This Week</Label>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Specialty</h4>
          <div className="space-y-2">
            {specialties.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <Checkbox
                  id={specialty}
                  checked={selectedSpecialties.includes(specialty)}
                  onCheckedChange={() => handleSpecialtyChange(specialty)}
                />
                <label
                  htmlFor={specialty}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {specialty}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default DentistFilter;
