import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import DentistCard from "@/components/DentistCard";
import DentistFilter from "@/components/DentistFilter";
import { mockDentists } from "@/data/mockDentists";
import { Dentist } from "@/types/dentist";
import { MapPin } from "lucide-react";
import { dentistAPI } from "@/services/api";
import { toast } from "sonner";

const DentistListing = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";

  const [filteredDentists, setFilteredDentists] = useState<Dentist[]>(mockDentists);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Apply filters and search
  useEffect(() => {
    setIsLoading(true);
    
    // Try to fetch dentists from API
    const fetchDentists = async () => {
      try {
        // Build params based on search and location
        const params: any = {};
        if (initialSearch) params.search = initialSearch;
        if (initialLocation) {
          // Try to extract city/state from location string
          if (initialLocation.includes(",")) {
            const [city, state] = initialLocation.split(",").map(s => s.trim());
            params.city = city;
            if (state) params.state = state;
          } else {
            params.city = initialLocation;
          }
        }
        
        const response = await dentistAPI.getAllDentists(params);
        
        if (response.data && Array.isArray(response.data.data)) {
          let results = response.data.data;
          applyFilters(results);
        } else {
          // Fallback to mock data with filters
          applyFiltersToMockData();
        }
      } catch (error) {
        console.error("Error fetching dentists:", error);
        // Fallback to mock data with filters
        applyFiltersToMockData();
      }
    };
    
    fetchDentists();
  }, [initialSearch, initialLocation, activeFilters]);

  // Apply filters to mock data (fallback)
  const applyFiltersToMockData = () => {
    setTimeout(() => {
      let results = [...mockDentists];
      
      // Apply search filter
      if (initialSearch) {
        const searchLower = initialSearch.toLowerCase();
        results = results.filter(
          (dentist) =>
            dentist.firstName.toLowerCase().includes(searchLower) ||
            dentist.lastName.toLowerCase().includes(searchLower) ||
            dentist.specialty.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply location filter
      if (initialLocation) {
        const locationLower = initialLocation.toLowerCase();
        results = results.filter(
          (dentist) =>
            dentist.city.toLowerCase().includes(locationLower) ||
            dentist.state.toLowerCase().includes(locationLower) ||
            dentist.zipCode.includes(locationLower)
        );
      }
      
      applyFilters(results);
    }, 500);
  };
  
  // Apply active filters to results
  const applyFilters = (results: Dentist[]) => {
    // Apply rating filter
    if (activeFilters.rating) {
      results = results.filter((dentist) => dentist.rating >= activeFilters.rating);
    }
    
    // Apply specialty filter
    if (activeFilters.specialties && activeFilters.specialties.length > 0) {
      results = results.filter((dentist) =>
        activeFilters.specialties.includes(dentist.specialty)
      );
    }
    
    // Apply availability filter
    if (activeFilters.availability) {
      // For demo purposes, just filter dentists who are accepting new patients
      results = results.filter((dentist) => dentist.acceptingNewPatients);
    }
    
    setFilteredDentists(results);
    setIsLoading(false);
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-8 bg-gray-50">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Dentist</h1>
          <SearchBar />
          
          {initialLocation && (
            <div className="mt-4 flex items-center text-gray-600">
              <MapPin className="h-4 w-4 text-dentist-500 mr-1" />
              <span>Showing results near: {initialLocation}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="sticky top-24">
                <DentistFilter onFilterChange={handleFilterChange} dentists={filteredDentists} />
              </div>
            </div>
            
            <div className="lg:w-3/4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="bg-gray-100 animate-pulse h-[400px] rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : filteredDentists.length > 0 ? (
                <div>
                  <p className="text-gray-600 mb-6">
                    Showing {filteredDentists.length} dentist
                    {filteredDentists.length !== 1 && "s"}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDentists.map((dentist) => (
                      <DentistCard key={dentist.id} dentist={dentist} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No dentists found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or filters to find more results.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DentistListing;
