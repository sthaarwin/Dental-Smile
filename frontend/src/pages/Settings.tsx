import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Lock,
  LogOut,
  CalendarDays,
  Save,
} from "lucide-react";

interface SettingsState {
  notifications: {
    email: boolean;
    sms: boolean;
    appointment: boolean;
    marketing: boolean;
  };
  privacy: {
    shareData: boolean;
    profileVisibility: boolean;
  };
  security: {
    twoFactor: boolean;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      sms: false,
      appointment: true,
      marketing: false,
    },
    privacy: {
      shareData: false,
      profileVisibility: true,
    },
    security: {
      twoFactor: false,
    },
  });
  
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    const userDataString = localStorage.getItem("user");
    
    if (!token || !userDataString) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setUserData(JSON.parse(userDataString));
    // Here you would typically load user settings from the backend
    // For now we're just using the default settings defined above
    setIsLoading(false);
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleSecurityChange = (key: keyof typeof settings.security, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save settings to the backend
    // For now, we'll just show a success message
    toast.success("Settings updated successfully");
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
        <title>Settings | Dental Smile</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-dentist-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-dentist-600" />
                    </div>
                    <div>
                      <CardTitle>{userData?.name || "User"}</CardTitle>
                      <CardDescription>{userData?.email || "user@example.com"}</CardDescription>
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
                    <Button variant="ghost" className="w-full justify-start bg-gray-100" asChild>
                      <Link to="/dashboard/settings">
                        <SettingsIcon className="w-5 h-5 mr-3" />
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
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-dentist-600" />
                      <CardTitle>Notification Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Email Notifications</p>
                        <p className="text-gray-500 text-sm">Receive notifications about your appointments via email</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">SMS Notifications</p>
                        <p className="text-gray-500 text-sm">Receive text messages about your appointments</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Appointment Reminders</p>
                        <p className="text-gray-500 text-sm">Get reminders before your scheduled appointments</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.appointment}
                        onCheckedChange={(checked) => handleNotificationChange('appointment', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Marketing Updates</p>
                        <p className="text-gray-500 text-sm">Receive promotional offers and news</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.marketing}
                        onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-dentist-600" />
                      <CardTitle>Privacy Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Data Sharing</p>
                        <p className="text-gray-500 text-sm">Allow sharing anonymized data for service improvements</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.shareData}
                        onCheckedChange={(checked) => handlePrivacyChange('shareData', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Profile Visibility</p>
                        <p className="text-gray-500 text-sm">Make your profile visible to dental professionals</p>
                      </div>
                      <Switch 
                        checked={settings.privacy.profileVisibility}
                        onCheckedChange={(checked) => handlePrivacyChange('profileVisibility', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-dentist-600" />
                      <CardTitle>Security Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-500 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      <Switch 
                        checked={settings.security.twoFactor}
                        onCheckedChange={(checked) => handleSecurityChange('twoFactor', checked)}
                      />
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button variant="outline" className="w-full mb-3">
                        Change Password
                      </Button>
                      <Button variant="destructive" className="w-full" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveSettings}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
