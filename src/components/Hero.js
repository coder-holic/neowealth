import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BiRocket, BiDollar, BiTrendingUp, BiChevronDown } from 'react-icons/bi';
import { Link } from 'react-router-dom';

const trackClick = (event) => console.log(`${event} clicked`);

const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const typedStrings = useMemo(
    () => ['Earn Commissions', 'Promote Products', 'Grow Your Income'],
    []
  );

  // Typing effect
  useEffect(() => {
    const type = () => {
      const currentString = typedStrings[stringIndex];
      if (isDeleting) {
        setTypedText(currentString.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex === 0) {
          setIsDeleting(false);
          setStringIndex((stringIndex + 1) % typedStrings.length);
        }
      } else {
        setTypedText(currentString.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex === currentString.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      }
    };
    const timer = setTimeout(type, isDeleting ? 50 : 120);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, stringIndex, typedStrings]);

  // Animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const scaleHover = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const features = [
    { icon: <BiDollar size={28} />, text: 'Earn Commissions' },
    { icon: <BiRocket size={28} />, text: 'Promote Products Easily' },
    { icon: <BiTrendingUp size={28} />, text: 'Grow Your Income' },
  ];

  return (
    <section
      id="home"
      className="relative pt-24 pb-32 flex items-center min-h-screen bg-gradient-to-b from-[#040000]/90 to-[#1b1a1a]/90 bg-hero bg-cover bg-center bg-fixed overflow-hidden"
    >
      <style>
        {`
          .bg-hero {
            background: linear-gradient(to bottom, navy 25%, red 75%);
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(15deg); }
          }
          .float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>

      {/* Floating background shapes */}
      <motion.div
        className="absolute top-10 left-10 w-40 h-40 bg-[#e59d02]/30 rounded-full float"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-32 h-32 bg-[#ffca5b]/20 rounded-full float"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#e59d02]/20 rounded-full float"
        animate={{ rotate: [0, 20, -20, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
      />

      <motion.div
        className="max-w-7xl mx-auto px-4 text-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.h1 className="text-4xl md:text-6xl font-['Raleway',sans-serif] font-bold mb-6">
          Join NEOWEALTH to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e59d02] to-[#ffca5b]">
            {typedText}
          </span>
        </motion.h1>

        <motion.p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
          Start earning today by promoting top-tier products and services with our affiliate program.
        </motion.p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <motion.div>
            <Link
              to="/login"
              className="inline-block bg-[#e59d02] text-white px-8 py-3 rounded-full font-semibold shadow-lg"
              onClick={() => trackClick('Hero_Signup')}
              variants={scaleHover}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              Join Now
            </Link>
          </motion.div>

          <motion.a
            href="#features"
            className="inline-block bg-transparent border-2 border-[#e59d02] text-[#e59d02] px-8 py-3 rounded-full font-semibold hover:bg-[#e59d02] hover:text-white transition-colors"
            onClick={() => trackClick('Hero_LearnMore')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.a>
        </div>

        {/* Feature Highlights */}
        <motion.div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-2 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i }}
            >
              <div className="bg-[#e59d02]/20 p-4 rounded-full">{feature.icon}</div>
              <p className="text-sm md:text-base">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce"
          whileHover={{ scale: 1.2 }}
        >
          <BiChevronDown size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;