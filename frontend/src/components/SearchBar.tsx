import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch?: (term: string) => void;
  initialSearch?: string;
  initialLocation?: string;
}

const SearchBar = ({ onSearch, initialSearch = "", initialLocation = "" }: SearchBarProps) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(search);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by dentist name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 py-6"
          />
        </div>
        <div className="relative flex-grow">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Location (city, state, zip)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 py-6"
          />
        </div>
        <Button type="submit" size="lg" className="whitespace-nowrap">
          Find Dentists
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
