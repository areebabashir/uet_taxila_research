import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FeaturedResearch from '@/components/FeaturedResearch';
import { Search, Filter, BookOpen, Award, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Research = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Research Header */}
      <section className="section-padding bg-gradient-hero text-white">
        <div className="container-max text-center">
          <h1 className="font-poppins text-5xl md:text-6xl font-bold mb-6">UET Taxila Research & Publications</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Explore UET Taxila's comprehensive collection of engineering research papers, publications, and academic contributions
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-card border-b">
        <div className="container-max">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search publications, authors, keywords..." 
                className="pl-10 py-3 text-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline">By Year</Button>
              <Button variant="outline">By Category</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Research Stats */}
      <section className="py-12 bg-background">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="card-academic p-6">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground mb-2">2,547</div>
              <div className="text-muted-foreground">Total Publications</div>
            </div>
            <div className="card-academic p-6">
              <Award className="h-12 w-12 text-secondary mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground mb-2">1,823</div>
              <div className="text-muted-foreground">Q1 & Q2 Journals</div>
            </div>
            <div className="card-academic p-6">
              <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground mb-2">285</div>
              <div className="text-muted-foreground">Publications This Year</div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedResearch />
      <Footer />
    </div>
  );
};

export default Research;