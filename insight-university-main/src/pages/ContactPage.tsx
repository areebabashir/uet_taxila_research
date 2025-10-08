import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/Contact';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Contact Header */}
      <section className="section-padding bg-gradient-hero text-white">
        <div className="container-max text-center">
          <h1 className="font-poppins text-5xl md:text-6xl font-bold mb-6">Contact UET Taxila</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Connect with UET Taxila's research office for engineering collaborations, academic support, and inquiries
          </p>
        </div>
      </section>

      <Contact />
      <Footer />
    </div>
  );
};

export default ContactPage;