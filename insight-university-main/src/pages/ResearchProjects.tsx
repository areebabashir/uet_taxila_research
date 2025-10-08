import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, DollarSign } from 'lucide-react';

const ResearchProjects = () => {
  // Mock data for research projects
  const projects = [
    {
      id: 1,
      title: "AI-Powered Healthcare Diagnostics",
      projectType: "Research Grant",
      status: "Active",
      totalBudget: 250000,
      fundingAgency: {
        name: "National Institutes of Health",
        country: "USA"
      },
      startDate: "2023-01-01",
      endDate: "2025-12-31",
      principalInvestigator: "Dr. Sarah Johnson",
      researchTeam: ["Dr. Michael Chen", "Dr. Emily Davis", "Dr. Robert Wilson"],
      description: "Developing AI algorithms for early detection of diseases using medical imaging and patient data.",
      keywords: ["AI", "Healthcare", "Diagnostics", "Medical Imaging"],
      objectives: [
        "Develop machine learning models for disease detection",
        "Create user-friendly diagnostic interface",
        "Validate models with clinical data",
        "Publish research findings"
      ]
    },
    {
      id: 2,
      title: "Sustainable Energy Storage Solutions",
      projectType: "Industry Collaboration",
      status: "Planning",
      totalBudget: 180000,
      fundingAgency: {
        name: "Department of Energy",
        country: "USA"
      },
      startDate: "2024-06-01",
      endDate: "2026-05-31",
      principalInvestigator: "Dr. Maria Rodriguez",
      researchTeam: ["Dr. James Thompson", "Dr. Anna Kim"],
      description: "Investigating novel materials and technologies for efficient energy storage systems.",
      keywords: ["Energy Storage", "Sustainability", "Materials Science"],
      objectives: [
        "Develop new battery technologies",
        "Improve energy density and efficiency",
        "Reduce environmental impact",
        "Scale up production processes"
      ]
    },
    {
      id: 3,
      title: "Cybersecurity for IoT Networks",
      projectType: "Government Contract",
      status: "Completed",
      totalBudget: 320000,
      fundingAgency: {
        name: "National Security Agency",
        country: "USA"
      },
      startDate: "2022-03-01",
      endDate: "2024-02-28",
      principalInvestigator: "Dr. David Kim",
      researchTeam: ["Dr. Lisa Zhang", "Dr. Robert Wilson"],
      description: "Developing comprehensive security frameworks for Internet of Things networks and devices.",
      keywords: ["Cybersecurity", "IoT", "Network Security"],
      objectives: [
        "Analyze IoT security vulnerabilities",
        "Develop protection mechanisms",
        "Create security protocols",
        "Implement testing frameworks"
      ]
    }
  ];

  const renderProjectCard = (project: any) => (
    <Card key={project.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <Badge variant={project.status === 'Active' ? 'default' : project.status === 'Completed' ? 'secondary' : 'outline'}>
            {project.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          {project.projectType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Budget: ${project.totalBudget.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Funding Agency: {project.fundingAgency.name}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Principal Investigator: {project.principalInvestigator}
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Team: {project.researchTeam.join(', ')}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          {project.description}
        </p>
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Objectives:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            {project.objectives.map((objective: string, index: number) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {project.keywords.map((keyword: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container-max py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Research Projects</h1>
          <p className="text-muted-foreground">
            Ongoing and completed research initiatives and collaborations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(renderProjectCard)}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ResearchProjects;