import React, { useState, useEffect } from 'react';
import { servicesAPI } from '@/services/api';
import { DentalService, ServiceCategory } from '@/types/service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, DollarSign } from 'lucide-react';

interface ServicesListProps {
  onServiceSelect?: (service: DentalService) => void;
  showBookingButton?: boolean;
}

const ServicesList: React.FC<ServicesListProps> = ({ 
  onServiceSelect,
  showBookingButton = false
}) => {
  const [services, setServices] = useState<DentalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchServices();
  }, [activeTab, currentPage]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const category = activeTab !== 'all' ? activeTab : undefined;
      const response = await servicesAPI.getActiveServices({
        category,
        search: searchTerm,
        page: currentPage,
        limit: 6
      });
      
      setServices(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchServices();
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-2">Our Dental Services</h2>
        <p className="text-muted-foreground text-center mb-6">
          Comprehensive care for all your dental needs
        </p>

        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 h-full"
              >
                Search
              </Button>
            </div>
          </form>
          
          <div className="w-full md:w-auto">
            <Tabs 
              defaultValue="all" 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 md:grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={ServiceCategory.GENERAL}>General</TabsTrigger>
                <TabsTrigger value={ServiceCategory.COSMETIC}>Cosmetic</TabsTrigger>
                <TabsTrigger value={ServiceCategory.ORTHODONTIC}>Orthodontic</TabsTrigger>
                <TabsTrigger value={ServiceCategory.SURGICAL}>Surgical</TabsTrigger>
                <TabsTrigger value={ServiceCategory.PREVENTIVE}>Preventive</TabsTrigger>
                <TabsTrigger value={ServiceCategory.PEDIATRIC}>Pediatric</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : services.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {service.category}
                  </span>
                </CardHeader>
                <CardContent className="pb-0">
                  <CardDescription className="line-clamp-3 mb-4">
                    {service.description}
                  </CardDescription>
                  <div className="flex items-center gap-x-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.duration} mins</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${service.price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                {showBookingButton && onServiceSelect && (
                  <CardFooter className="pt-4">
                    <Button 
                      onClick={() => onServiceSelect(service)}
                      variant="default" 
                      className="w-full"
                    >
                      Book This Service
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No services found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ServicesList;