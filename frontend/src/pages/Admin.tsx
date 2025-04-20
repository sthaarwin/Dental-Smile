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
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Edit,
  Shield,
  Users,
  Calendar,
  PieChart,
  Search,
  Filter,
  Grid,
  UserPlus,
  CheckCircle,
  XCircle,
  Trash,
  Phone,
  Mail,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { appointmentAPI, servicesAPI } from "@/services/api";
import { DentalService } from "@/types/service";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: string;
  profile_picture?: string;
  created_at: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  patient: any;
  dentist: any;
  service: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
}

const Admin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<DentalService[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDentists, setTotalDentists] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    role: ""
  });
  const [appointmentFilter, setAppointmentFilter] = useState("all");

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // If not admin, redirect to dashboard
      if (user.role !== "admin") {
        toast.error("You don't have permission to access Admin page");
        navigate("/dashboard");
      }
    }

    // Fetch users, appointments, and services data
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users data
      const usersResponse = await axios.get('/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Ensure userData is an array
      const userData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      setUsers(userData);
      
      // Calculate stats
      setTotalPatients(userData.filter(user => user.role === "patient").length);
      setTotalDentists(userData.filter(user => user.role === "dentist").length);
      
      // Fetch appointments data
      const appointmentsResponse = await axios.get('/api/appointments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Ensure appointmentData is an array
      const appointmentData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];
      setAppointments(appointmentData);
      setTotalAppointments(appointmentData.length);
      setCompletedAppointments(appointmentData.filter(apt => apt.status === "completed").length);
      
      // Fetch services data
      const servicesResponse = await servicesAPI.getAllServices();
      // Map the service data to match our expected interface
      const serviceData = servicesResponse.data.data || [];
      const mappedServices = serviceData.map((service: any) => ({
        ...service,
        id: service._id, // Map _id to id for frontend usage
        active: service.isActive // Map isActive to active for frontend usage
      })) as DentalService[];
      setServices(mappedServices);
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUserAction = (user: User) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      phone_number: user.phone_number || "",
      role: user.role
    });
    setIsUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.put(`/api/users/${selectedUser.id}`, editUserForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...editUserForm } : user
      ));
      
      toast.success("User updated successfully");
      setIsUserDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(`/api/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
      toast.success(`User ${selectedUser.name} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateAppointmentStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`/api/appointments/${id}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === id ? { ...apt, status: status as any } : apt
      ));
      
      toast.success("Appointment status updated");
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const handleServiceStatusToggle = async (service: DentalService) => {
    try {
      // Use the _id property when calling the API but use the active alias locally
      if (service.isActive) {
        await servicesAPI.deactivateService(service._id || "");
      } else {
        await servicesAPI.activateService(service._id || "");
      }
      
      // Update local state
      setServices(services.map(s => 
        s._id === service._id ? { ...s, isActive: !service.isActive, active: !service.isActive } : s
      ));
      
      toast.success(`Service ${service.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast.error("Failed to update service status");
    }
  };

  // Filter users based on search term and role
  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole === "all" || user.role === filterRole)
  ) : [];

  // Filter appointments based on status
  const filteredAppointments = Array.isArray(appointments) ? (
    appointmentFilter === "all" 
      ? appointments 
      : appointments.filter(apt => apt.status === appointmentFilter)
  ) : [];

  // If user is not logged in or not admin, redirect to login
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Admin Control Panel | Dental Smile</title>
      </Helmet>

      <Navbar />

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
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard">
                        <CalendarDays className="w-5 h-5 mr-3" />
                        User Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to="/dashboard/services">
                        <Grid className="w-5 h-5 mr-3" />
                        Manage Services
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
              <h1 className="text-3xl font-bold text-gray-800">Admin Control Panel</h1>
              
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-dentist-50 border-dentist-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                      <h2 className="text-3xl font-bold text-gray-800">{totalPatients}</h2>
                    </div>
                    <Users className="w-12 h-12 text-dentist-400" />
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Dentists</p>
                      <h2 className="text-3xl font-bold text-gray-800">{totalDentists}</h2>
                    </div>
                    <User className="w-12 h-12 text-blue-400" />
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Appointments</p>
                      <h2 className="text-3xl font-bold text-gray-800">{totalAppointments}</h2>
                    </div>
                    <Calendar className="w-12 h-12 text-green-400" />
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-100">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Completed Appointments</p>
                      <h2 className="text-3xl font-bold text-gray-800">{completedAppointments}</h2>
                    </div>
                    <CheckCircle className="w-12 h-12 text-purple-400" />
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
                <Tabs defaultValue="users">
                  <TabsList className="grid w-full md:w-[400px] grid-cols-3">
                    <TabsTrigger value="users" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Appointments
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center">
                      <Grid className="mr-2 h-4 w-4" />
                      Services
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Users Tab */}
                  <TabsContent value="users" className="space-y-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search users by name or email"
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={filterRole} onValueChange={setFilterRole}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="dentist">Dentist</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="whitespace-nowrap">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add User
                        </Button>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                  No users found
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center">
                                      <Avatar className="h-8 w-8 mr-2">
                                        <AvatarImage src={user.profile_picture} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      {user.name}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <div className="flex items-center text-sm">
                                        <Mail className="mr-1 h-3 w-3 text-gray-500" />
                                        {user.email}
                                      </div>
                                      {user.phone_number && (
                                        <div className="flex items-center text-sm text-gray-500">
                                          <Phone className="mr-1 h-3 w-3 text-gray-500" />
                                          {user.phone_number}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className={`
                                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                      ${user.role === 'admin' 
                                        ? 'bg-red-100 text-red-800' 
                                        : user.role === 'dentist' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-green-100 text-green-800'
                                      }
                                    `}>
                                      {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                                      {user.role === 'dentist' && <User className="mr-1 h-3 w-3" />}
                                      {user.role === 'patient' && <Users className="mr-1 h-3 w-3" />}
                                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end">
                                      <Button variant="ghost" size="sm" onClick={() => handleUserAction(user)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteUser(user)}>
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Appointments Tab */}
                  <TabsContent value="appointments" className="space-y-4 py-4">
                    <div className="flex justify-between gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search appointments"
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={appointmentFilter} onValueChange={setAppointmentFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient</TableHead>
                              <TableHead>Dentist</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAppointments.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                  No appointments found
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAppointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                  <TableCell className="font-medium">
                                    {appointment.patient?.name || "Unknown Patient"}
                                  </TableCell>
                                  <TableCell>
                                    {appointment.dentist?.name || "Unknown Dentist"}
                                  </TableCell>
                                  <TableCell>
                                    {appointment.service}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span>{appointment.date}</span>
                                      <span className="text-gray-500 text-sm">{appointment.time}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className={`
                                      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                      ${appointment.status === 'scheduled' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : appointment.status === 'completed' 
                                          ? 'bg-green-100 text-green-800' 
                                          : appointment.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                      }
                                    `}>
                                      {appointment.status === 'scheduled' && <Clock className="mr-1 h-3 w-3" />}
                                      {appointment.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                                      {appointment.status === 'cancelled' && <XCircle className="mr-1 h-3 w-3" />}
                                      {appointment.status === 'no-show' && <XCircle className="mr-1 h-3 w-3" />}
                                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Select onValueChange={(status) => handleUpdateAppointmentStatus(appointment.id, status)}>
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Update" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="no-show">No Show</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Services Tab */}
                  <TabsContent value="services" className="space-y-4 py-4">
                    <div className="flex justify-between gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search services"
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button asChild>
                          <Link to="/dashboard/services">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Service Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {services.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                  No services found
                                </TableCell>
                              </TableRow>
                            ) : (
                              services.map((service) => (
                                <TableRow key={service._id}>
                                  <TableCell className="font-medium">
                                    {service.name}
                                  </TableCell>
                                  <TableCell>
                                    {service.category}
                                  </TableCell>
                                  <TableCell>
                                    {service.duration} min
                                  </TableCell>
                                  <TableCell>
                                    ${service.price}
                                  </TableCell>
                                  <TableCell>
                                    {service.isActive ? (
                                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Active
                                      </div>
                                    ) : (
                                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Inactive
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end">
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/dashboard/services?edit=${service._id}`}>
                                          <Edit className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                      {service.isActive ? (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-orange-600"
                                          onClick={() => handleServiceStatusToggle(service)}
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      ) : (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-green-600"
                                          onClick={() => handleServiceStatusToggle(service)}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
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
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user account details.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={editUserForm.name} 
                  onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={editUserForm.phone_number}
                  onChange={(e) => setEditUserForm({...editUserForm, phone_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={editUserForm.role}
                  onValueChange={(value) => setEditUserForm({...editUserForm, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

const Plus = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export default Admin;