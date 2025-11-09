import React, { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import Header from './components/Header';
import Hero from './components/Hero';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import './App.css'

// Stylish section divider component
const SectionDivider = ({ color = '#0000ff', flip = false }) => (
  <div className="relative w-full overflow-hidden">
   <div></div>
  </div>
);

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollTopVisible, setIsScrollTopVisible] = useState(false);

  useEffect(() => {
    const handleScroll = debounce(() => {
      setIsScrolled(window.scrollY > 100);
      setIsScrollTopVisible(window.scrollY > 100);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, []);

  return (
    <div className="bg-[#ff0000] text-white font-['Roboto',sans-serif]">
      {/* Header */}
      <Header isScrolled={isScrolled} />

      {/* Hero Section */}
      <section id="hero-section">
        <Hero />
      </section>

      {/* Divider */}
      <SectionDivider color="ff0000" />

      {/* Main Content Section */}
      <section id="main-content-sections">
        <MainContent />
      </section>

      {/* Divider */}
      <SectionDivider color="#040000" flip />

      {/* Footer Section */}
      <section id="footer-section" className="bg-hero">
        <Footer isScrollTopVisible={isScrollTopVisible} />
      </section>
    </div>
  );
};

export default App;
