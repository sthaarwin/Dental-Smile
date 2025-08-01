import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Stethoscope, 
  Heart, 
  Baby, 
  Smile, 
  Sparkles, 
  AlertCircle, 
  Apple, 
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const ResourceCard = ({ icon, title, description, link }: ResourceCardProps) => (
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full">
    <div className="mb-4 bg-dentist-50 p-3 rounded-full w-fit text-dentist-600">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 mb-4 flex-grow">{description}</p>
    <Button asChild variant="outline" className="w-full border border-dentist-200 text-dentist-700 hover:bg-dentist-50">
      <a href={link} target="_blank" rel="noopener noreferrer">
        Learn More
      </a>
    </Button>
  </div>
);

const DentalResources = () => {
  const generalResourceCards = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Oral Care Guidelines",
      description: "Learn the basics of good oral hygiene practices for a lifetime of healthy smiles.",
      link: "https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/home-care",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Oral Health and Wellness",
      description: "Discover the connections between oral health and your overall well-being.",
      link: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/dental/art-20047475",
    },
    {
      icon: <Baby className="w-8 h-8" />,
      title: "Pediatric Dental Care",
      description: "Tips and resources for maintaining your child's dental health from infancy through adolescence.",
      link: "https://www.aapd.org/resources/parent/",
    },
    {
      icon: <Smile className="w-8 h-8" />,
      title: "Cosmetic Dentistry Guide",
      description: "Explore options for improving your smile, from whitening to veneers and beyond.",
      link: "https://www.aacd.com/cosmetic-dentistry-procedures",
    },
  ];

  const professionalResourceCards = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Latest Dental Techniques",
      description: "Stay updated with the latest advancements in dental procedures and technologies.",
      link: "https://jada.ada.org/",
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "Dental Emergency Guide",
      description: "Learn how to handle common dental emergencies until you can see a professional.",
      link: "https://www.aae.org/patients/dental-symptoms/",
    },
    {
      icon: <Apple className="w-8 h-8" />,
      title: "Nutrition and Oral Health",
      description: "Understand the impact of diet and nutrition on your dental wellness.",
      link: "https://www.ada.org/resources/research/science-and-research-institute/oral-health-topics/nutrition-and-oral-health",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Dental Education Resources",
      description: "Educational materials for dental students, professionals, and those interested in the field.",
      link: "https://www.adea.org/",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Oral Health Library | Dental Smile</title>
        <meta name="description" content="Explore our collection of dental resources for patients and professionals. Find helpful information on oral hygiene, treatments, and dental health." />
      </Helmet>

      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-dentist-600 to-dentist-500 py-16 mt-6 text-white">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Oral Health Library</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Explore our curated collection of resources to learn more about dental care
                and oral health best practices.
              </p>
            </div>
          </div>
        </section>

        {/* General Resources */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">For Patients</h2>
              <p className="text-lg text-gray-600">
                Helpful information to better understand your dental health and treatment options.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {generalResourceCards.map((card, index) => (
                <ResourceCard
                  key={index}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  link={card.link}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Professional Resources */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">For Professionals</h2>
              <p className="text-lg text-gray-600">
                Resources for dental professionals and those interested in dental education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {professionalResourceCards.map((card, index) => (
                <ResourceCard
                  key={index}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  link={card.link}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

     </div>
  );
};

export default DentalResources;