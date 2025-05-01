import React, { useState, useEffect } from 'react';
import { 
  DentalService, 
  CreateServiceRequest, 
  ServiceCategory,
  PaginatedServicesResponse
} from '../types/service';
import { servicesAPI } from '../services/api';
import { validateDentalServiceForm } from '../lib/formValidation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface ServiceFormProps {
  initialData?: DentalService;
  onSubmit: (data: CreateServiceRequest) => Promise<void>;
  onCancel: () => void;
}

// Form component for adding or editing a service
const ServiceForm: React.FC<ServiceFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 30,
    price: initialData?.price || 0,
    category: initialData?.category || ServiceCategory.GENERAL,
    imageUrl: initialData?.imageUrl || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert string values to numbers for number inputs
    const processedValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user changes selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationResult = validateDentalServiceForm(formData);
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Form submission is handled by parent component
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'border-red-500' : ''}
          rows={4}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min={5}
            value={formData.duration}
            onChange={handleChange}
            className={errors.duration ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
        </div>
        
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            value={formData.price}
            onChange={handleChange}
            className={errors.price ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleSelectChange('category', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ServiceCategory).map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>
      
      <div>
        <Label htmlFor="imageUrl">Image URL (optional)</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl || ''}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Service' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
};

// Main service management component
const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<DentalService[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentService, setCurrentService] = useState<DentalService | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServices = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await servicesAPI.getAllServices({
        page,
        limit: 10,
        search: searchTerm,
      });
      
      const data = response.data;
      setServices(data.data);
      setTotalServices(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async (data: CreateServiceRequest) => {
    try {
      const response = await servicesAPI.createService(data);
      toast.success('Service added successfully');
      setShowForm(false);
      fetchServices(currentPage); // Refresh the list
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to add service');
      }
      throw error;
    }
  };

  const handleUpdateService = async (data: CreateServiceRequest) => {
    if (!currentService?._id) return;
    
    try {
      const response = await servicesAPI.updateService(currentService._id, data);
      toast.success('Service updated successfully');
      setShowForm(false);
      setCurrentService(undefined);
      fetchServices(currentPage); // Refresh the list
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to update service');
      }
      throw error;
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.deleteService(id);
        toast.success('Service deleted successfully');
        fetchServices(currentPage); // Refresh the list
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const handleToggleActive = async (id: string, isCurrentlyActive: boolean) => {
    try {
      if (isCurrentlyActive) {
        await servicesAPI.deactivateService(id);
        toast.success('Service deactivated');
      } else {
        await servicesAPI.activateService(id);
        toast.success('Service activated');
      }
      fetchServices(currentPage); // Refresh the list
    } catch (error) {
      console.error('Error toggling service state:', error);
      toast.error('Failed to update service');
    }
  };

  const handleEditClick = (service: DentalService) => {
    setCurrentService(service);
    setShowForm(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices(1); // Reset to first page when searching
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setCurrentService(undefined);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dental Services</h1>
          <p className="text-gray-500">
            Manage your dental practice's service offerings
          </p>
        </div>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        )}
      </div>
      
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{currentService ? 'Edit Service' : 'Add New Service'}</CardTitle>
            <CardDescription>
              {currentService 
                ? 'Update the service details below' 
                : 'Fill in the details to add a new service to your practice'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm
              initialData={currentService}
              onSubmit={currentService ? handleUpdateService : handleAddService}
              onCancel={handleCancelForm}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search form */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
          
          {/* Services list */}
          {isLoading ? (
            <p>Loading services...</p>
          ) : services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Duration</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-4">{service.name}</td>
                      <td className="px-4 py-4 capitalize">{service.category}</td>
                      <td className="px-4 py-4">{service.duration} mins</td>
                      <td className="px-4 py-4">${service.price.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        {service.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleActive(
                              service._id!, 
                              service.isActive !== false
                            )}
                          >
                            {service.isActive !== false ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditClick(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteService(service._id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-10">No services found</p>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchServices(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchServices(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceManagement;