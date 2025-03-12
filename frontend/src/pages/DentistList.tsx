import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import DentistCard from "@/components/DentistCard";
import DentistFilter from "@/components/DentistFilter";
import { mockDentists } from "@/data/mockDentists";
import { Dentist } from "@/types/dentist";

const DentistList = () => {
  const [filteredDentists, setFilteredDentists] = useState<Dentist[]>(mockDentists);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Additional search logic could be added here if needed
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Find a Dentist | Smile Schedule Saver</title>
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
                  dentists={mockDentists}
                />
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                  <span className="font-medium">{filteredDentists.length}</span> dentists found
                  {searchTerm && <span> for "{searchTerm}"</span>}
                </p>
                <div className="flex items-center">
                  <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
                  <select id="sort" className="text-sm border rounded p-1">
                    <option value="recommended">Recommended</option>
                    <option value="rating">Highest Rating</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDentists.map((dentist) => (
                  <div 
                    key={dentist.id} 
                    className="transform transition duration-200 hover:scale-[1.02] hover:shadow-md"
                  >
                    <DentistCard dentist={dentist} />
                  </div>
                ))}
              </div>
              
              {filteredDentists.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No dentists found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                  <button 
                    onClick={() => setFilteredDentists(mockDentists)} 
                    className="bg-dentist-600 hover:bg-dentist-700 text-white px-4 py-2 rounded-md"
                  >
                    Clear filters
                  </button>
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

export default DentistList;
