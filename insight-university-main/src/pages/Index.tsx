import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import UETInfo from '@/components/UETInfo';
import FeaturedResearch from '@/components/FeaturedResearch';
import ResearchAnalytics from '@/components/ResearchAnalytics';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <UETInfo />
      <FeaturedResearch />
      <ResearchAnalytics />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;