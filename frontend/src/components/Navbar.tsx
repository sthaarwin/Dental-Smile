
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Log In
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link to="/signup">
                  <User className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
