import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import axios from 'axios';

const defaultTestimonials = [
  { id: 1, name: "Arjun Singh", role: "Wheat Farmer", country: "India", rating: 5, text: "AgriChain completely transformed how I sell my wheat. No middlemen, direct payment, and totally secure.", image: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Maria Garcia", role: "Coffee Exporter", country: "Colombia", rating: 5, text: "The international trading features and multilingual support make exporting coffee seamless and profitable.", image: "https://i.pravatar.cc/150?img=5" },
  { id: 3, name: "David Chen", role: "Wholesale Buyer", country: "Singapore", rating: 4, text: "Blockchain verification guarantees the origin of the produce. I can trust what I am buying.", image: "https://i.pravatar.cc/150?img=8" },
  { id: 4, name: "Sarah Johnson", role: "Cooperative Manager", country: "USA", rating: 5, text: "Our entire cooperative now uses the platform. The analytics dashboard is incredible.", image: "https://i.pravatar.cc/150?img=9" },
  { id: 5, name: "Ahmed Ali", role: "Date Farmer", country: "Egypt", rating: 5, text: "Smart contracts give me peace of mind. I know I will get paid the moment my delivery is confirmed.", image: "https://i.pravatar.cc/150?img=12" },
  { id: 6, name: "Elena Rostova", role: "Grain Buyer", country: "Russia", rating: 4, text: "Excellent platform. The UI is incredibly fast and responsive.", image: "https://i.pravatar.cc/150?img=28" }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by thousands globally</h2>
          <p className="text-gray-600">See what our community has to say about AgriChain.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 z-10 hidden md:block">
            <button onClick={prev} className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute top-1/2 -right-12 -translate-y-1/2 z-10 hidden md:block">
            <button onClick={next} className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-hidden px-4 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-background rounded-3xl p-8 md:p-12 border border-gray-100 relative shadow-xl shadow-primary/5"
              >
                <Quote className="absolute top-8 right-8 w-16 h-16 text-primary/10 rotate-180" />
                <div className="flex text-accent mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-8 relative z-10">
                  "{testimonials[currentIndex].text}"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h5 className="font-bold text-gray-900">{testimonials[currentIndex].name}</h5>
                    <p className="text-sm text-gray-500">{testimonials[currentIndex].role}, {testimonials[currentIndex].country}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}