import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin, FiYoutube } from 'react-icons/fi';
import acmLogo from '../assets/acm.jpeg';

const Footer = () => {
  return (
    <footer className="bg-theme-black text-theme-light-gray py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* BITS ACM Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-3 mb-4">
              <img src={acmLogo} alt="BITS ACM" className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="text-theme-accent-yellow font-bold text-lg">BITS ACM</h3>
                <p className="text-sm text-theme-light-gray">Student Chapter</p>
              </div>
            </div>
            <a 
              href="https://github.com/bitsacm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-theme-light-gray hover:text-theme-warm-yellow transition-colors duration-200"
            >
              <FiGithub size={18} />
              <span>BITS ACM Organization</span>
            </a>
          </div>

          {/* Project Repositories */}
          <div className="text-center md:text-left">
            <h3 className="text-theme-accent-yellow font-bold text-lg mb-4">Contributing to Pollz</h3>
            <div className="space-y-2">
              <a 
                href="https://github.com/bitsacm/pollz-frontend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start space-x-2 text-theme-light-gray hover:text-theme-warm-yellow transition-colors duration-200"
              >
                <FiGithub size={16} />
                <span>Frontend Repository</span>
              </a>
              <a 
                href="https://github.com/bitsacm/pollz-backend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start space-x-2 text-theme-light-gray hover:text-theme-warm-yellow transition-colors duration-200"
              >
                <FiGithub size={16} />
                <span>Backend Repository</span>
              </a>
              <a 
                href="https://github.com/bitsacm/pollz-websocket" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start space-x-2 text-theme-light-gray hover:text-theme-warm-yellow transition-colors duration-200"
              >
                <FiGithub size={16} />
                <span>WebSocket Repository</span>
              </a>
            </div>
          </div>

          {/* Project Creator Section */}
          <div className="text-center md:text-right">
            <h3 className="text-theme-accent-yellow font-bold text-lg mb-4">Project Creator</h3>
            <div className="mb-3">
              <p className="font-semibold text-theme-warm-yellow">Ayush Gupta (Madmecodes)</p>
              <p className="text-sm text-theme-light-gray">Open Source Lead at BITS ACM</p>
            </div>
            <div className="flex justify-center md:justify-end space-x-4">
              <a 
                href="https://x.com/madmecodes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-theme-light-gray hover:text-theme-warm-yellow transition-colors duration-200"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a 
                href="https://www.youtube.com/results?search_query=@madmecodes" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-theme-light-gray hover:text-theme-warm-yellow transition-colors duration-200"
                aria-label="YouTube"
              >
                <FiYoutube size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/feed/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-theme-light-gray hover:text-theme-warm-yellow transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-theme-dark-gray mt-8 pt-6 text-center">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-theme-light-gray">
              © 2025 POLLZ - Pilani Unified Voting System
            </p>
            <p className="text-sm text-theme-light-gray">
            Code. Create. Contribute. — BITS ACM
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;