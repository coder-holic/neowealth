import React from 'react';
import { motion } from 'framer-motion';
import { BiSolidUpArrowCircle, BiEnvelope, BiPhone } from 'react-icons/bi';
import { FaMap, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const trackClick = (event) => console.log(`${event} clicked`);

const Footer = ({ isScrollTopVisible }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackClick('Scroll_Top');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <footer className="relative bg-gradient-to-t from-[#0000ff] via-[#ff0000] to-[#ff0000] text-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Info */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#e59d02] to-[#ffca5b]">
            NEOWEALTH
          </h3>
          <p className="text-gray-300">
            Empowering affiliates to earn, promote, and grow their online income seamlessly.
          </p>
          <div className="flex space-x-4 mt-5">
            {[{icon: FaTwitter, name:'Twitter'}, {icon: FaLinkedin, name:'LinkedIn'}, {icon: FaInstagram, name:'Instagram'}].map((social) => (
              <motion.a
                key={social.name}
                href="#"
                whileHover={{ scale: 1.3, color: '#e59d02' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => trackClick(social.name)}
                className="text-gray-300 hover:text-[#e59d02] transition-colors"
              >
                <social.icon size={22} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h4 className="font-semibold text-xl mb-4">Quick Links</h4>
          <ul className="space-y-3 text-gray-300">
            {['Home', 'About', 'Features', 'Services', 'Pricing', 'FAQ', 'Team', 'Contact'].map((link) => (
              <li key={link}>
                <motion.a
                  href={`#${link.toLowerCase()}`}
                  whileHover={{ scale: 1.05, color: '#e59d02' }}
                  onClick={() => trackClick(`Footer_${link}`)}
                  className="transition-colors"
                >
                  {link}
                </motion.a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h4 className="font-semibold text-xl mb-4">Contact</h4>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center gap-3">
              <FaMap className="text-[#e59d02]" />
              <span>13 Abayomi Durosinmi-Etti St, Marketing City, NIGERIA</span>
            </div>
            <div className="flex items-center gap-3">
              <BiEnvelope className="text-[#e59d02]" />
              <span>support@NEOWEALTH.com</span>
            </div>
            <div className="flex items-center gap-3">
              <BiPhone className="text-[#e59d02]" />
            </div>
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h4 className="font-semibold text-xl mb-4">Stay Updated</h4>
          <p className="text-gray-300 mb-5">
            Subscribe to receive the latest updates and tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 bg-white/10 p-3 rounded-2xl shadow-inner transition-all hover:shadow-lg">
            <input
              type="email"
              placeholder="Your Email"
              className="p-3 rounded-xl bg-[#040000] border border-[#e59d02] text-white flex-1 focus:outline-none focus:ring-2 focus:ring-[#e59d02] transition-all"
            />
            <motion.button
              type="submit"
              className="bg-[#e59d02] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-md"
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                trackClick('Subscribe_Click');
              }}
            >
              Subscribe
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-16 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} NEOWEALTH. All rights reserved.
      </div>

      {/* Scroll to Top */}
      <motion.button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#e59d02] to-[#ffca5b] text-black p-4 rounded-full shadow-lg animate-pulse"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrollTopVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <BiSolidUpArrowCircle size={28} />
      </motion.button>
    </footer>
  );
};

export default Footer;
