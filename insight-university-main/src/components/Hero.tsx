import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const Hero = () => {
  return (
    <section 
      className="relative section-padding bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80"></div>
      
      <div className="container-max relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-poppins text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            UET Taxila Research &{' '}
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
              Analytics Portal
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            University of Engineering and Technology Taxila - Centralized platform for research, publications, and academic excellence.
            Discover breakthrough research and connect with our engineering community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              className="btn-hero text-lg px-8 py-6 rounded-xl"
            >
              <Link to="/research" className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Explore Research</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="btn-outline-hero text-lg px-8 py-6 rounded-xl bg-white/10 backdrop-blur-sm"
            >
              <Link to="/faculty" className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>View Faculty</span>
              </Link>
            </Button>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;