import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import ContactForm from './ContactForm';

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'registrar@uettaxila.edu.pk',
      subtitle: 'Send us your inquiries',
    },
    {
      icon: Phone,
      title: 'Phone',
      details: '+92 51-9047-400',
      subtitle: 'Mon-Fri, 9AM-5PM',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: 'University of Engineering & Technology',
      subtitle: 'Taxila, Pakistan',
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: 'Monday - Friday',
      subtitle: '9:00 AM - 5:00 PM',
    },
  ];


  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Contact UET Taxila</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with UET Taxila's research office for engineering collaborations, inquiries, or support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="font-poppins text-2xl font-semibold mb-6">Get In Touch</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We're here to assist you with engineering research collaborations, publication support, 
                funding opportunities, and any questions about UET Taxila's academic programs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div key={index} className="card-academic p-6 text-center group hover:scale-105 transition-transform">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{info.title}</h4>
                    <p className="text-foreground font-medium mb-1">{info.details}</p>
                    <p className="text-muted-foreground text-sm">{info.subtitle}</p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Map */}
            <div className="card-academic p-6">
              <h4 className="font-semibold text-lg mb-4">Find Us</h4>
              <div className="relative rounded-lg overflow-hidden h-64 bg-gradient-to-br from-blue-50 to-indigo-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.123456789!2d72.8478!3d33.7456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfa8b8b8b8b8b8%3A0x1234567890abcdef!2sUniversity%20of%20Engineering%20and%20Technology%20Taxila!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UET Taxila Location"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm text-primary">UET Taxila</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://www.google.com/maps/dir//University+of+Engineering+and+Technology+Taxila"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;