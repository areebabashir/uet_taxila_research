import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  MapPin, 
  Phone, 
  Mail,
  Globe,
  Building2,
  Microscope
} from 'lucide-react';

const UETInfo = () => {
  const departments = [
    'Computer Engineering',
    'Software Engineering', 
    'Cyber Technology',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Industrial Engineering'
  ];

  const programs = [
    { name: 'Bachelor Programs', count: '15+', icon: GraduationCap },
    { name: 'Master Programs', count: '10+', icon: BookOpen },
    { name: 'PhD Programs', count: '8+', icon: Award },
    { name: 'Faculty Members', count: '200+', icon: Users }
  ];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-poppins text-4xl md:text-5xl font-bold text-primary mb-6">
            University of Engineering & Technology Taxila
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A premier institution of higher learning in Pakistan, dedicated to excellence in engineering education, 
            research, and innovation since its establishment.
          </p>
        </div>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {programs.map((program, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <program.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
                <p className="text-3xl font-bold text-primary">{program.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Departments and Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Engineering Departments
              </CardTitle>
              <CardDescription>
                Comprehensive range of engineering disciplines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {dept}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Get in touch with UET Taxila
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>+92 51-9047-400</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>registrar@uettaxila.edu.pk</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary" />
                <span>www.uettaxila.edu.pk</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <span>University of Engineering and Technology Taxila, Pakistan</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Programs */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-primary" />
                Special Programs & Research
              </CardTitle>
              <CardDescription>
                Advanced programs and research initiatives at UET Taxila
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold mb-2">Web Development Programs</h4>
                  <p className="text-sm text-muted-foreground">
                    Full Stack Web Development (MERN Stack), ASP.NET, and modern web technologies
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold mb-2">Cyber Technology</h4>
                  <p className="text-sm text-muted-foreground">
                    BS Cyber Technology with courses in web programming and mobile app development
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold mb-2">e-Rozgaar Center</h4>
                  <p className="text-sm text-muted-foreground">
                    Freelancing training programs and entrepreneurship development
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UETInfo;
