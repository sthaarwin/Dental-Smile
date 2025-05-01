import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Edit2,
  Settings, 
  LogOut, 
  CalendarDays,
  Camera,
  Upload
} from "lucide-react";
import { userAPI, authAPI } from "@/services/api";

interface UserProfile {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  profile_picture?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone_number: "",
    address: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        
        setIsLoading(true);
        
        // Get user data from localStorage
        const storedUserData = localStorage.getItem("user");
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            phone_number: userData.phone_number || "",
            address: userData.address || "",
            profile_picture: userData.profile_picture || ""
          });
          
          if (userData.profile_picture) {
            setImagePreview(userData.profile_picture);
          }
          
          // Extract user role
          if (userData.role) {
            setUserRole(userData.role);
          }
        }
        
        // Try to get the most up-to-date user data from the API
        try {
          const response = await authAPI.getCurrentUser();
          if (response && response.data) {
            const userData = response.data;
            setProfile({
              name: userData.name || profile.name,
              email: userData.email || profile.email,
              phone_number: userData.phone_number || profile.phone_number,
              address: userData.address || profile.address,
              profile_picture: userData.profile_picture || profile.profile_picture
            });
            
            if (userData.profile_picture) {
              setImagePreview(userData.profile_picture);
            }
            
            // Extract user role from API response
            if (userData.role) {
              setUserRole(userData.role);
            }
            
            // Update localStorage with the latest data
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } catch (apiError) {
          console.error("Failed to fetch user data from API:", apiError);
          // Continue with the data from localStorage
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // First upload profile picture if it was changed
      let profilePictureUrl = profile.profile_picture;
      if (imagePreview && imagePreview !== profile.profile_picture) {
        try {
          // If imagePreview starts with "data:" it's a newly selected file
          if (imagePreview.startsWith('data:')) {
            setIsUploadingImage(true);
            // Convert base64 to blob
            const response = await fetch(imagePreview);
            const blob = await response.blob();
            const file = new File([blob], "profile-picture.jpg", { 
              type: blob.type || 'image/jpeg' 
            });
            
            // Create form data for upload
            const formData = new FormData();
            formData.append('image', file);
            
            console.log("Uploading image to Cloudinary...");
            
            // Upload the image to Cloudinary via our backend
            const uploadResponse = await userAPI.uploadProfilePicture(formData);
            console.log("Upload response:", uploadResponse);
            
            if (uploadResponse && uploadResponse.data && uploadResponse.data.imageUrl) {
              profilePictureUrl = uploadResponse.data.imageUrl;
              console.log("New profile picture URL:", profilePictureUrl);
              
              // Update imagePreview with the Cloudinary URL
              setImagePreview(profilePictureUrl);
            } else {
              console.error("Invalid upload response structure:", uploadResponse);
              toast.error("Failed to process uploaded image");
              setIsUploadingImage(false);
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to upload profile picture:", error);
          toast.error("Failed to upload profile picture");
          setIsUploadingImage(false);
          setIsLoading(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }
      
      // Update the user profile
      const updateData = {
        name: profile.name,
        email: profile.email,
        phone_number: profile.phone_number,
        address: profile.address,
        profile_picture: profilePictureUrl
      };
      
      console.log("Updating profile with data:", updateData);
      
      // Send the update to the backend
      const response = await userAPI.updateProfile(updateData);
      console.log("Profile update response:", response);
      
      if (response && response.data) {
        // Update the local state
        setProfile({
          ...profile,
          ...response.data,
          profile_picture: profilePictureUrl || profile.profile_picture
        });
        
        // Update the data in localStorage
        const storedUserData = localStorage.getItem("user");
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          const updatedUserData = {
            ...userData,
            ...updateData
          };
          localStorage.setItem("user", JSON.stringify(updatedUserData));
          console.log("Updated user data in localStorage:", updatedUserData);
        }
        
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    toast.success("Logged out successfully!");
  };
  
  if (isLoading && isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dentist-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Profile | Smile Schedule Saver</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex flex-col items-center space-y-4">
                    <div 
                      className="w-24 h-24 rounded-full bg-dentist-100 flex items-center justify-center relative overflow-hidden"
                      onClick={isEditing && !isUploadingImage ? handleImageClick : undefined}
                      style={{cursor: (isEditing && !isUploadingImage) ? 'pointer' : 'default'}}
                    >
                      {isUploadingImage ? (
                        <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dentist-600"></div>
                        </div>
                      ) : imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-dentist-600" />
                      )}
                      
                      {isEditing && !isUploadingImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="text-center">
                      <CardTitle>{profile.name}</CardTitle>
                      <CardDescription>{profile.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {userRole === 'admin' ? (
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/admin">
                          <CalendarDays className="w-5 h-5 mr-3" />
                          Admin Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/dashboard">
                          <CalendarDays className="w-5 h-5 mr-3" />
                          Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/dashboard/profile">
                        <User className="w-5 h-5 mr-3" />
                        Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
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

            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>Cancel</>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="block lg:hidden">
                    <div className="flex flex-col items-center mb-6">
                      <div 
                        className="w-28 h-28 rounded-full bg-dentist-100 flex items-center justify-center relative overflow-hidden"
                        onClick={isEditing && !isUploadingImage ? handleImageClick : undefined}
                        style={{cursor: (isEditing && !isUploadingImage) ? 'pointer' : 'default'}}
                      >
                        {isUploadingImage ? (
                          <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-dentist-600"></div>
                          </div>
                        ) : imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-14 h-14 text-dentist-600" />
                        )}
                        
                        {isEditing && !isUploadingImage && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="w-10 h-10 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone_number"
                          value={profile.phone_number}
                          onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <Input
                          id="address"
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
