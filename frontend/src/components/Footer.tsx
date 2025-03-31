import { Link, useLocation } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollTop } from "@/hooks/useScrollTop";

const Footer = () => {
  const location = useLocation();
  const { scrollToTop } = useScrollTop();  // Destructure the hook return value

  const handleNavClick = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <footer className="bg-dentist-800 text-white pt-12 pb-8 relative">
      {/* Scroll to top button */}
      <Button
        onClick={() => scrollToTop()}  // Call the function
        className="absolute -top-5 right-8 bg-white hover:bg-gray-100 text-dentist-800 rounded-full w-10 h-10 p-0 shadow-lg border border-gray-200 flex items-center justify-center group transition-all duration-300 hover:scale-110"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
      </Button>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-dentist-800 font-bold text-xl">DS</span>
              </div>
              <span className="text-xl font-bold">DentalSmile</span>
            </div>
            <p className="text-dentist-100 mb-4">
              Making dental care accessible and stress-free for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="" className="text-white hover:text-dentist-300">
                <Facebook size={20} />
              </a>
              <a href="" className="text-white hover:text-dentist-300">
                <Twitter size={20} />
              </a>
              <a href="" className="text-white hover:text-dentist-300">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/')}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/dentists" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/dentists')}
                >
                  Find Dentists
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/about')}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/contact')}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">For Dentists</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/dentist-signup" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/dentist-signup')}
                >
                  Join as Dentist
                </Link>
              </li>
              <li>
                <Link 
                  to="/dentist-login" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/dentist-login')}
                >
                  Dentist Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/how-it-works" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/how-it-works')}
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-dentist-100 hover:text-white transition"
                  onClick={handleNavClick('/faq')}
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <p className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span>123 Dental Street, Medical District, City, 12345</span>
              </p>
              <p className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <span>(123) 456-7890</span>
              </p>
              <p className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <span>info@dentalsmile.com</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-dentist-700 mt-8 pt-6 text-center text-dentist-200">
          <p>&copy; {new Date().getFullYear()} DentalSmile. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
