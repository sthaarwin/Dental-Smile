import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import DentistCard from "@/components/DentistCard";
import DentistFilter from "@/components/DentistFilter";
import { Dentist } from "@/types/dentist";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dentistAPI } from "@/services/api";
import { mockDentists } from "@/data/mockDentists"; // Import mock data

const DentistList = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<Dentist[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Fetch all dentists from the backend or use mock data
  useEffect(() => {
    const fetchDentists = async () => {
      setIsLoading(true);
      try {
        const response = await dentistAPI.getAllDentists();
        // Check if response has data and the data property contains the dentist array
        if (response.data && Array.isArray(response.data.data)) {
          // Use the actual dentist array from the nested data property
          setDentists(response.data.data);
          setFilteredDentists(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          // Fallback in case the API returns dentists directly without nesting
          setDentists(response.data);
          setFilteredDentists(response.data);
        } else {
          // If no valid data is received, use mock data
          toast.error("Received unexpected data format, using demo data");
          setDentists(mockDentists);
          setFilteredDentists(mockDentists);
        }
      } catch (error) {
        console.error("Error fetching dentists:", error);
        toast.error("Using demo data - backend API not available");
        // Fallback to mock data when API fails
        setDentists(mockDentists);
        setFilteredDentists(mockDentists);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDentists();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredDentists(dentists);
      return;
    }
    
    const lowercaseTerm = term.toLowerCase();
    const results = dentists.filter((dentist) => 
      dentist.firstName.toLowerCase().includes(lowercaseTerm) ||
      dentist.lastName.toLowerCase().includes(lowercaseTerm) ||
      dentist.specialty.toLowerCase().includes(lowercaseTerm) ||
      dentist.city.toLowerCase().includes(lowercaseTerm) ||
      dentist.state.toLowerCase().includes(lowercaseTerm)
    );
    
    setFilteredDentists(results);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Find a Dentist | Dental Smile</title>
        <meta name="description" content="Browse our network of qualified dentists and book your next dental appointment with ease." />
      </Helmet>
      
      <Navbar />
      
      <div className="pt-24 pb-8 bg-gray-50 flex-grow">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Dentist</h1>
          <p className="text-gray-600 mb-6">Browse our network of trusted dental professionals and book your appointment today</p>
          
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DentistFilter 
                  onFilterChange={setFilteredDentists}
                  dentists={dentists}
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-dentist-600 animate-spin mb-4" />
                    <p className="text-dentist-600">Loading dentists...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                    <p className="text-gray-600">
                      <span className="font-medium">{filteredDentists.length}</span> dentists found
                      {searchTerm && <span> for "{searchTerm}"</span>}
                    </p>
                    <div className="flex items-center">
                      <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
                      <select 
                        id="sort" 
                        className="text-sm border rounded p-1"
                        onChange={(e) => {
                          const sorted = [...filteredDentists];
                          if (e.target.value === 'rating') {
                            sorted.sort((a, b) => {
                              // Handle new dentists (0 rating) when sorting
                              if (a.rating === 0 && b.rating === 0) return 0;  // Both are new dentists
                              if (a.rating === 0) return 1;  // Put single new dentist after rated ones
                              if (b.rating === 0) return -1; // Put single new dentist after rated ones
                              return b.rating - a.rating;    // Normal rating comparison
                            });
                          } else if (e.target.value === 'reviews') {
                            sorted.sort((a, b) => b.reviewCount - a.reviewCount);
                          }
                          setFilteredDentists(sorted);
                        }}
                      >
                        <option value="recommended">Recommended</option>
                        <option value="rating">Highest Rating</option>
                        <option value="reviews">Most Reviews</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDentists.length > 0 ? (
                      filteredDentists.map((dentist) => (
                        <div 
                          key={dentist.id} 
                          className="transform transition duration-200 hover:scale-[1.02] hover:shadow-md"
                        >
                          <DentistCard dentist={dentist} />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 bg-white rounded-lg shadow-sm p-8 text-center">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No dentists found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                        <button 
                          onClick={() => {
                            setFilteredDentists(dentists);
                            setSearchTerm("");
                          }} 
                          className="bg-dentist-600 hover:bg-dentist-700 text-white px-4 py-2 rounded-md"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DentistList;
