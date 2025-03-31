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
import { userAPI } from "@/services/api";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    profile_picture: "",
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    loadUserProfile();
    setIsLoading(false);
  };

  const loadUserProfile = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        profile_picture: user.profile_picture || "",
      });
      setImagePreview(user.profile_picture || null);
      console.log("Loaded profile data:", user);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Size validation
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      
      try {
        // Show a loading state
        toast.loading("Uploading image...");
        
        // For preview - create a temporary local URL
        const reader = new FileReader();
        reader.onloadend = () => {
          const preview = reader.result as string;
          setImagePreview(preview);
        };
        reader.readAsDataURL(file);
        
        // Upload to server using the dedicated profile picture upload endpoint
        const imageUrl = await userAPI.uploadProfilePicture(file);
        
        // Update profile with the image URL from server
        setProfile(prev => ({ ...prev, profile_picture: imageUrl }));
        
        // Also update the user data in localStorage so the header shows the updated picture
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        userData.profile_picture = imageUrl;
        localStorage.setItem("user", JSON.stringify(userData));
        
        toast.dismiss();
        toast.success("Image uploaded successfully");
      } catch (error) {
        toast.dismiss();
        toast.error("Failed to upload image");
        console.error("Image upload error:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving profile:", profile);
      
      // Don't include profile_picture in general profile update
      // since we handle it separately via the upload API
      const profileData = {
        name: profile.name,
        email: profile.email,
        phone_number: profile.phone_number,
        address: profile.address,
      };
      
      const response = await userAPI.updateProfile(profileData);
      
      console.log("Backend response:", response.data);
      
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { 
        ...userData,
        name: profile.name,
        email: profile.email,
        phone_number: profile.phone_number,
        address: profile.address,
        // Keep the existing profile_picture from localStorage
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("Updated localStorage:", updatedUser);
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dentist-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
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
                      onClick={isEditing ? handleImageClick : undefined}
                      style={{cursor: isEditing ? 'pointer' : 'default'}}
                    >
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-dentist-600" />
                      )}
                      
                      {isEditing && (
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
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/dashboard">
                        <CalendarDays className="w-5 h-5 mr-3" />
                        Dashboard
                      </Link>
                    </Button>
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
                        onClick={isEditing ? handleImageClick : undefined}
                        style={{cursor: isEditing ? 'pointer' : 'default'}}
                      >
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-16 h-16 text-dentist-600" />
                        )}
                        
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={handleImageClick}
                        >
                          Change Photo
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
