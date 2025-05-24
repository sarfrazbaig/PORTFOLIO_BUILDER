
'use client';

import { usePortfolioContext } from '@/contexts/portfolio-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Info, Layers } from 'lucide-react'; // Replaced ExternalLink with Layers for internal link indication
import Image from 'next/image';
import Link from 'next/link';

export default function ProjectsPage() {
  const { cvData } = usePortfolioContext();

  if (!cvData || !cvData.projects || cvData.projects.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 md:px-6">
        <Card className="max-w-2xl mx-auto shadow-md border-l-4 border-accent">
          <CardHeader>
            <div className="flex items-center">
              <Info size={24} className="mr-3 text-accent" />
              <CardTitle className="text-xl text-accent">No Projects Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We couldn&apos;t find any project information in your CV data.
              The AI is designed to extract projects from your entire CV, not just a dedicated section.
              If you believe projects are mentioned, please try re-uploading and parsing your CV on the dashboard.
              You will also be able to add projects manually or with AI assistance in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { projects } = cvData;

  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <section id="projects">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
            <Lightbulb size={40} className="mr-4"/>Featured Projects
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            A selection of projects I&apos;ve developed, showcasing my skills and interests.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {projects.map((project, index) => (
            <Link key={index} href={`/portfolio/projects/${encodeURIComponent(project.name || `project-${index}`)}`} passHref>
              <Card 
                className="shadow-lg flex flex-col hover:shadow-2xl transition-shadow duration-300 border-2 border-border/30 hover:border-accent group bg-card/90 backdrop-blur-sm overflow-hidden rounded-xl h-full cursor-pointer"
              >
                <div className="relative overflow-hidden aspect-[16/10]">
                  <Image 
                    src={`https://placehold.co/600x375.png`} 
                    alt={project.name || 'Project image'} 
                    width={600} 
                    height={375} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint="project application screenshot"
                  />
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-xl md:text-2xl text-primary group-hover:text-accent transition-colors">{project.name || 'Untitled Project'}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-grow">
                  <p className="text-md text-muted-foreground mb-4 whitespace-pre-line leading-relaxed line-clamp-3">{project.description || 'No description available.'}</p>
                </CardContent>
                 <CardContent className="p-6 pt-0 border-t border-border/30 mt-auto">
                   <Button variant="ghost" className="w-full group/link text-accent hover:text-accent-foreground transition-all duration-300 py-3 text-md mt-4">
                       View Details <Layers size={18} className="ml-2 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                   </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
