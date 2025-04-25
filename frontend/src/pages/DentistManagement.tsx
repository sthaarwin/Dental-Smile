import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  User,
  FileText,
  Settings,
  LogOut,
  Edit,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Trash,
  Phone,
  Mail,
  UserCheck as UserCheckIcon,
  Stethoscope,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/services/api"; // Import the configured API instance

interface DentistApplication {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialties: string;
  experience: string;
  education: string;
  certifications: string;
  practiceName: string;
  applicationStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const DentistManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dentistApplications, setDentistApplications] = useState<DentistApplication[]>([]);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<DentistApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalDentists, setTotalDentists] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [applicationFilter, setApplicationFilter] = useState("pending");

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // If not admin, redirect to dashboard
      if (user.role !== "admin") {
        toast.error("You don't have permission to access this page");
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }

    // Fetch dentist applications
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch dentist applications data from the API
      const applicationsResponse = await api.get('/dentists/applications');
      
      if (Array.isArray(applicationsResponse.data)) {
        setDentistApplications(applicationsResponse.data);
        setPendingApplications(applicationsResponse.data.filter(app => app.applicationStatus === "pending").length);
        
        // Count approved dentists
        const approvedCount = applicationsResponse.data.filter(app => app.applicationStatus === "approved").length;
        setTotalDentists(approvedCount);
        
        toast.success("Data loaded successfully");
      } else {
        toast.error("Received unexpected data format from API");
        useMockData();
      }
    } catch (error) {
      console.error("Error fetching dentist applications:", error);
      toast.error("Failed to load data from API, using demonstration data instead");
      useMockData();
    } finally {
      setIsLoading(false);
    }
  };
  
  const useMockData = () => {
    // Mock data for demonstration
    const mockApplications: DentistApplication[] = [
      {
        id: "app1",
        userId: "user123",
        firstName: "Robert",
        lastName: "Johnson",
        email: "robert.johnson@example.com",
        phone: "(555) 123-4567",
        licenseNumber: "DDS123456",
        specialties: "General Dentistry, Cosmetic Dentistry",
        experience: "15",
        education: "DDS, Harvard School of Dental Medicine\nBS in Biology, Boston University",
        certifications: "American Dental Association (ADA)\nMassachusetts Dental Society",
        practiceName: "Downtown Dental Care",
        applicationStatus: "pending" as 'pending',
        submittedAt: "2023-12-01"
      },
      {
        id: "app2",
        userId: "user456",
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@example.com",
        phone: "(555) 987-6543",
        licenseNumber: "DDS654321",
        specialties: "Orthodontics",
        experience: "8",
        education: "DDS, University of Michigan School of Dentistry\nMS in Orthodontics, Northwestern University",
        certifications: "American Association of Orthodontists\nBoard Certified, American Board of Orthodontics",
        practiceName: "Clear Smile Orthodontics",
        applicationStatus: "pending" as 'pending',
        submittedAt: "2023-12-05"
      },
      {
        id: "app3",
        userId: "user789",
        firstName: "James",
        lastName: "Wilson",
        email: "james.wilson@example.com",
        phone: "(555) 456-7890",
        licenseNumber: "DDS789123",
        specialties: "Pediatric Dentistry",
        experience: "12",
        education: "DDS, University of Washington School of Dentistry\nResidency in Pediatric Dentistry, Seattle Children's Hospital",
        certifications: "American Academy of Pediatric Dentistry\nWashington State Dental Association",
        practiceName: "Kids Smile Dental",
        applicationStatus: "approved" as 'approved',
        submittedAt: "2023-11-20"
      }
    ];
    
    setDentistApplications(mockApplications);
    setPendingApplications(mockApplications.filter(app => app.applicationStatus === "pending").length);
    setTotalDentists(mockApplications.filter(app => app.applicationStatus === "approved").length);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleViewApplication = (application: DentistApplication) => {
    setSelectedApplication(application);
    setIsApplicationDialogOpen(true);
  };

  const handleApplicationAction = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      // API call to update application status
      await api.patch(`/dentists/applications/${applicationId}/status`, { status });
      
      // Update local state
      setDentistApplications(dentistApplications.map(app => 
        app.id === applicationId ? { ...app, applicationStatus: status } : app
      ));
      
      // Update counts
      if (status === 'approved') {
        setTotalDentists(prev => prev + 1);
      }
      setPendingApplications(prev => prev - 1);
      
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setIsApplicationDialogOpen(false);
    } catch (error) {
      console.error(`Error ${status} application:`, error);
      toast.error(`Failed to ${status} application`);
    }
  };

  // Filter dentist applications based on status and search term
  const filteredApplications = Array.isArray(dentistApplications) ? (
    dentistApplications
      // First filter by status
      .filter(app => applicationFilter === "all" || app.applicationStatus === applicationFilter)
      // Then filter by search term
      .filter(app => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          app.firstName.toLowerCase().includes(searchLower) ||
          app.lastName.toLowerCase().includes(searchLower) ||
          `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchLower) ||
          app.specialties.toLowerCase().includes(searchLower) ||
          app.licenseNumber.toLowerCase().includes(searchLower) ||
          app.practiceName.toLowerCase().includes(searchLower)
        );
      })
  ) : [];

  // If user is not logged in, redirect to login
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Manage Dentists | Dental Smile</title>
      </Helmet>

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={currentUser?.profile_picture} alt={currentUser?.name} />
                      <AvatarFallback>{currentUser?.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{currentUser?.name}</CardTitle>
                      <CardDescription className="flex items-center text-dentist-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/admin">
                        <Shield className="w-5 h-5 mr-3" />
                        Admin Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard/dentists">
                        <Stethoscope className="w-5 h-5 mr-3" />
                        Manage Dentists
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard/profile">
                        <User className="w-5 h-5 mr-3" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard/settings">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4 space-y-8">
              <h1 className="text-3xl font-bold text-gray-800">Manage Dentists</h1>
              
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Dentists</p>
                      <h2 className="text-3xl font-bold text-gray-800">{totalDentists}</h2>
                    </div>
                    <Stethoscope className="w-12 h-12 text-blue-400" />
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Pending Applications</p>
                      <h2 className="text-3xl font-bold text-gray-800">{pendingApplications}</h2>
                    </div>
                    <UserCheckIcon className="w-12 h-12 text-yellow-400" />
                  </CardContent>
                </Card>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dentist-600"></div>
                    <p className="text-dentist-600">Loading data...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search applications"
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={fetchData}
                        title="Refresh data"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Select value={applicationFilter} onValueChange={setApplicationFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Applications</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>License Number</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApplications.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                No applications found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredApplications.map((application) => (
                              <TableRow key={application.id}>
                                <TableCell className="font-medium">
                                  Dr. {application.firstName} {application.lastName}
                                </TableCell>
                                <TableCell>
                                  {application.specialties}
                                </TableCell>
                                <TableCell>
                                  {application.licenseNumber}
                                </TableCell>
                                <TableCell>
                                  {new Date(application.submittedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className={`
                                    inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                    ${application.applicationStatus === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : application.applicationStatus === 'approved' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }
                                  `}>
                                    {application.applicationStatus === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                                    {application.applicationStatus === 'approved' && <CheckCircle className="mr-1 h-3 w-3" />}
                                    {application.applicationStatus === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                                    {application.applicationStatus.charAt(0).toUpperCase() + application.applicationStatus.slice(1)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewApplication(application)}>
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    {application.applicationStatus === 'pending' && (
                                      <>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-green-600"
                                          onClick={() => handleApplicationAction(application.id, 'approved')}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-red-600"
                                          onClick={() => handleApplicationAction(application.id, 'rejected')}
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* View Application Dialog */}
      <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Dentist Application</DialogTitle>
            <DialogDescription>
              Review the dentist's application details below.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 py-4 max-h-[calc(80vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Full Name</Label>
                      <p className="font-medium">Dr. {selectedApplication.firstName} {selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Contact Information</Label>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p>{selectedApplication.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p>{selectedApplication.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Practice Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">Practice Name</Label>
                      <p className="font-medium">{selectedApplication.practiceName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Specialties</Label>
                      <p>{selectedApplication.specialties}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Experience</Label>
                      <p>{selectedApplication.experience} years</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Professional Credentials</h3>
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-gray-500">License Number</Label>
                          <p className="font-medium">{selectedApplication.licenseNumber}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Education</Label>
                          {selectedApplication.education.split('\n').map((edu, i) => (
                            <p key={i} className="text-gray-800">{edu}</p>
                          ))}
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Certifications</Label>
                          {selectedApplication.certifications.split('\n').map((cert, i) => (
                            <p key={i} className="text-gray-800">{cert}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Label className="text-sm font-medium">Application Status:</Label>
                <div className={`
                  inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                  ${selectedApplication.applicationStatus === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : selectedApplication.applicationStatus === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }
                `}>
                  {selectedApplication.applicationStatus === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                  {selectedApplication.applicationStatus === 'approved' && <CheckCircle className="mr-1 h-3 w-3" />}
                  {selectedApplication.applicationStatus === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                  {selectedApplication.applicationStatus.charAt(0).toUpperCase() + selectedApplication.applicationStatus.slice(1)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedApplication && selectedApplication.applicationStatus === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleApplicationAction(selectedApplication.id, 'rejected')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApplicationAction(selectedApplication.id, 'approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Application
                </Button>
              </>
            )}
            {(selectedApplication && selectedApplication.applicationStatus !== 'pending') && (
              <Button
                variant="outline"
                onClick={() => setIsApplicationDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DentistManagement;