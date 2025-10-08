import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import uetLogo from '@/assets/download-removebg-preview.png';

const Footer = () => {
  const quickLinks = [
    { name: 'About University', href: '/about' },
    { name: 'Research', href: '/research' },
    { name: 'Faculty Directory', href: '/faculty' },
    { name: 'Projects', href: '/projects' },
    { name: 'Funding Opportunities', href: '/funding' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const researchAreas = [
    'Computer Engineering',
    'Software Engineering',
    'Cyber Technology',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container-max">
        {/* Main Footer Content */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* University Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img src={uetLogo} alt="UET Taxila Logo" className="h-12 w-auto" />
              <div>
                <div className="font-poppins font-bold text-lg">UET Taxila</div>
                <div className="text-primary-foreground/80 text-sm">Engineering Excellence</div>
              </div>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Advancing knowledge through innovative research, fostering academic excellence, 
              and building partnerships that transform communities and industries.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Areas */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Research Areas</h3>
            <ul className="space-y-3">
              {researchAreas.map((area, index) => (
                <li key={index}>
                  <Link
                    to={`/research?category=${area.toLowerCase().replace(' ', '-')}`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-1 text-primary-foreground/80" />
                <div className="text-primary-foreground/80">
                  <div>University of Engineering & Technology</div>
                  <div>Taxila, Pakistan</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-foreground/80" />
                <div className="text-primary-foreground/80">+92 51-9047-400</div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-foreground/80" />
                <div className="text-primary-foreground/80">registrar@uettaxila.edu.pk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-primary-foreground/20 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-primary-foreground/80 text-sm">
              © 2024 UET Taxila Research Portal. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Terms of Use
              </Link>
              <Link to="/accessibility" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;