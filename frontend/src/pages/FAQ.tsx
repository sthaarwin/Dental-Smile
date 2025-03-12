import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "General",
    question: "How does Smile Schedule Saver work?",
    answer: "Smile Schedule Saver is an online platform that connects patients with dental professionals. You can search for dentists, read reviews, compare credentials, and book appointments online 24/7."
  },
  {
    category: "General",
    question: "Is the service free to use?",
    answer: "Yes, Smile Schedule Saver is completely free for patients to use. There are no hidden fees or charges for booking appointments through our platform."
  },
  {
    category: "Appointments",
    question: "How do I schedule an appointment?",
    answer: "Simply search for a dentist, select your preferred time slot, and fill in your details. You'll receive an instant confirmation email once your appointment is booked."
  },
  {
    category: "Appointments",
    question: "Can I cancel or reschedule my appointment?",
    answer: "Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time through your account dashboard."
  },
  {
    category: "Dentists",
    question: "Are all dentists verified?",
    answer: "Yes, we verify the credentials and licenses of all dental professionals on our platform to ensure quality care."
  },
  {
    category: "Dentists",
    question: "How can dentists join the platform?",
    answer: "Dentists can sign up through our 'Join as Dentist' page. We review applications and verify credentials before approving profiles."
  },
  // Add more FAQs as needed
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(current => 
      current.includes(index) 
        ? current.filter(i => i !== index)
        : [...current, index]
    );
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>FAQ | Smile Schedule Saver</title>
        <meta name="description" content="Find answers to frequently asked questions about Smile Schedule Saver's dental appointment booking service." />
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about our service
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {categories.map((category, categoryIndex) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{category}</h2>
                <div className="space-y-4">
                  {faqs
                    .filter(faq => faq.category === category)
                    .map((faq, index) => {
                      const actualIndex = index + categoryIndex * 10;
                      return (
                        <div
                          key={actualIndex}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(actualIndex)}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-left text-gray-900">
                              {faq.question}
                            </span>
                            {openItems.includes(actualIndex) ? (
                              <Minus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <Plus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {openItems.includes(actualIndex) && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                              <p className="text-gray-600">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Still have questions?{" "}
              <Link to="/contact" className="text-dentist-600 hover:text-dentist-700 font-medium">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
