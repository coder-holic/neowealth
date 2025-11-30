import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BiDollarCircle,
  BiLineChart,
  BiSolidBox,
  BiBook,
  BiSupport,
  BiWrench,
} from 'react-icons/bi';
import { FaTwitter, FaLinkedin } from 'react-icons/fa';
import image1 from "../assets/user.jpeg"

// A more engaging hover effect for interactive elements
const whileHoverEffects = { scale: 1.05, rotate: 1 };
const whileTapEffects = { scale: 0.95 };

// Utility component for section dividers
const SectionDivider = ({ className = '' }) => (
  <div className={`relative w-full h-16 ${className}`}>
    <svg
      className="absolute bottom-0 left-0 right-0 w-full h-full text-transparent"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        fill="currentColor"
        fillOpacity="1"
        d="M0,192L48,170.7C96,149,192,107,288,117.3C384,128,480,192,576,218.7C672,245,768,235,864,213.3C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
  </div>
);

// Card components with refined styles and animations
const FeatureCard = memo(({ feature }) => (
  <motion.div
    className="relative p-8 rounded-2xl shadow-xl transition-all overflow-hidden cursor-pointer
      bg-radial-gradient from-[#1b1a1a] to-[#0a0a0a]
      hover:shadow-2xl hover:border-2 hover:border-[#e59d02] group"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={whileHoverEffects}
    whileTap={whileTapEffects}
  >
    <div className="text-center mb-4 text-[#e59d02] text-5xl">{feature.icon}</div>
    <h3 className="text-2xl font-semibold text-center mb-2">{feature.title}</h3>
    <p className="text-gray-400 text-center">{feature.description}</p>
  </motion.div>
));

const ServiceCard = memo(({ service, index }) => (
  <motion.div
    className="relative p-8 rounded-2xl shadow-xl transition-all overflow-hidden
      bg-radial-gradient from-[#1b1a1a] to-[#0a0a0a]
      hover:shadow-2xl hover:border-2 hover:border-[#e59d02] group"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={whileHoverEffects}
    whileTap={whileTapEffects}
  >
    <span className="absolute top-4 right-4 text-white/10 font-bold text-5xl z-0">{`0${index + 1}`}</span>
    <div className="relative z-10">
      <div className="text-center mb-4 text-[#e59d02] text-5xl">{service.icon}</div>
      <h3 className="text-2xl font-semibold text-center mb-2">{service.title}</h3>
      <p className="text-gray-400 text-center">{service.description}</p>
    </div>
  </motion.div>
));

// Updated Testimonial Card with a more modern look
const TestimonialCard = memo(({ testimonial }) => (
  <motion.div
    className="w-full flex justify-center"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.6 }}
  >
    <div className="p-8 bg-radial-gradient from-[#1b1a1a] to-[#0a0a0a] rounded-2xl shadow-xl text-center max-w-lg">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-[#e59d02] object-cover"
        loading="lazy"
      />
      <p className="text-lg italic text-gray-300 mb-4 leading-relaxed">"{testimonial.quote}"</p>
      <h3 className="text-xl font-semibold">{testimonial.name}</h3>
      <p className="text-[#e59d02]">{testimonial.role}</p>
    </div>
  </motion.div>
));

// Updated Team Card with a more engaging hover state
const TeamCard = memo(({ member }) => (
  <motion.div
    className="relative w-full flex justify-center"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative group p-6 rounded-2xl shadow-xl transition-all overflow-hidden
      bg-radial-gradient from-[#1b1a1a] to-[#0a0a0a] flex flex-col items-center">
      <img
        src={member.image}
        alt={member.name}
        className="w-24 h-24 rounded-full mb-4 border-2 border-[#e59d02] object-cover"
        loading="lazy"
      />
      <h3 className="text-xl font-semibold">{member.name}</h3>
      <p className="text-[#e59d02] mb-4">{member.role}</p>
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-[#040000]/80 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"
        initial={{ opacity: 0 }}
      >
        <a href={member.social.twitter} className="mx-2 text-[#e59d02] hover:text-white transition-colors">
          <FaTwitter size={28} />
        </a>
        <a href={member.social.linkedin} className="mx-2 text-[#e59d02] hover:text-white transition-colors">
          <FaLinkedin size={28} />
        </a>
      </motion.div>
    </div>
  </motion.div>
));


// Main component with updated sections and a hero component
const MainContent = () => {
  const [testimonialSlide, setTestimonialSlide] = useState(0);
  const [teamSlid, setTeamSlide] = useState(0);

  const features = useMemo(
    () => [
      { title: 'High Commissions', description: 'Earn up to 50% commission on every sale.', icon: <BiDollarCircle /> },
      { title: 'Easy Tracking', description: 'Real-time analytics to monitor your clicks and earnings.', icon: <BiLineChart /> },
      { title: 'Wide Range of Products', description: 'Promote from a curated selection of top-tier products.', icon: <BiSolidBox /> },
    ],
    []
  );

  const services = useMemo(
    () => [
      { title: 'Affiliate Training', description: 'Access free training to maximize your earnings.', icon: <BiBook /> },
      { title: 'Dedicated Support', description: 'Get 24/7 support from our affiliate team.', icon: <BiSupport /> },
      { title: 'Marketing Tools', description: 'Use our banners, links, and widgets to promote.', icon: <BiWrench /> },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      { name: 'Jonathan Lam', role: 'Affiliate Marketer', quote: 'NEOWEALTH helped me e5,000 in my first month!', image: image1 },
      { name: 'Clinton James', role: 'Blogger', quote: 'The tracking tools are fantastic and easy to use.', image: image1 },
    ],
    []
  );

  const team = useMemo(
    () => [
      { name: 'Coach Tion', role: 'Affiliate Manager', image: image1, social: { twitter: '#', linkedin: '#' } },
      { name: 'Coach Daniel', role: 'Marketing Lead', image: image1, social: { twitter: '#', linkedin: '#' } },
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => setTestimonialSlide((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(() => setTeamSlide((prev) => (prev + 1) % team.length), 5000);
    return () => clearInterval(interval);
  }, [team.length]);

  return (
    <div className="font-sans text-white relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#e59d02] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-8 bg-[#0000ff] text-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-[#e59d02] mb-4 leading-tight tracking-wider"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Power Your Income with NEOWEALTH
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            The ultimate platform for affiliate marketers to earn competitive commissions on high-quality products.
          </motion.p>
          <motion.a
            href="#features"
            className="inline-block px-8 py-4 text-lg font-bold text-black bg-[#e59d02] rounded-full shadow-lg transition-transform hover:scale-105 hover:shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Discover Our Features
          </motion.a>
        </div>
      </section>

      <SectionDivider className="bg-[#ff0000]" />

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#ff0000]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose NEOWEALTH
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider className="bg-[#0000ff]" />

      {/* Services Section */}
      <section id="services" className="py-20 bg-[#0000ff]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Services
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider className="bg-[#ff0000]" />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-[#ff0000]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What Our Affiliates Say
          </motion.h2>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) =>
                index === testimonialSlide && <TestimonialCard key={index} testimonial={testimonial} />
              )}
            </AnimatePresence>
            <div className="flex justify-center mt-8 gap-4">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-4 h-4 rounded-full ${index === testimonialSlide ? 'bg-[#e59d02]' : 'bg-gray-600'}`}
                  onClick={() => setTestimonialSlide(index)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider className="bg-[#0000ff]" />

      {/* Team Section */}
      <section id="team" className="py-20 bg-[#0000ff]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 justify-items-center">
            {team.map((member, index) => <TeamCard key={index} member={member} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainContent;