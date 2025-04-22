import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogIn, UserCircle, Settings, Grid, Shield, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDashboardUrlByRole } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Get the appropriate dashboard URL based on user role
  const dashboardUrl = getDashboardUrlByRole(user?.role);

  return (
    <nav className="bg-white py-4 px-6 shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-dentist-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">DS</span>
            </div>
            <span className="text-xl font-bold text-dentist-800">DentalSmile</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-dentist-600 font-medium">
              Home
            </Link>
            <Link to="/dentists" className="text-gray-700 hover:text-dentist-600 font-medium">
              Find Dentists
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-dentist-600 font-medium">
              About Us
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-dentist-600 font-medium">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {token ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profile_picture} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    {user?.name || 'Profile'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={dashboardUrl} className="flex items-center">
                      {user?.role === 'dentist' ? (
                        <Stethoscope className="h-4 w-4 mr-2" />
                      ) : user?.role === 'admin' ? (
                        <Shield className="h-4 w-4 mr-2" />
                      ) : (
                        <User className="h-4 w-4 mr-2" />
                      )}
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/services" className="flex items-center">
                          <Grid className="h-4 w-4 mr-2" />
                          Manage Services
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">
                    <User className="h-4 w-4 mr-2" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-dentist-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 space-y-3">
            <Link
              to="/"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/services"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/dentists"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Dentists
            </Link>
            <Link
              to="/about"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="block py-2 px-4 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-2 space-y-2">
              {token ? (
                <>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to={dashboardUrl} className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                      {user?.role === 'dentist' ? (
                        <Stethoscope className="h-4 w-4 mr-2" />
                      ) : user?.role === 'admin' ? (
                        <Shield className="h-4 w-4 mr-2" />
                      ) : (
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={user?.profile_picture} alt={user?.name} />
                          <AvatarFallback>{user?.name?.charAt(0) || 'P'}</AvatarFallback>
                        </Avatar>
                      )}
                      Dashboard
                    </Link>
                  </Button>
                  {user?.role === 'admin' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Page
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/dashboard/services" onClick={() => setIsMenuOpen(false)}>
                          <Grid className="h-4 w-4 mr-2" />
                          Manage Services
                        </Link>
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Log In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
