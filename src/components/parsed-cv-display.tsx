'use client';

import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Briefcase, GraduationCap, Lightbulb, Mail, Phone, Linkedin, Github, UserCircle, FileText, Sparkles, Link as LinkIcon, MapPin, CalendarDays } from 'lucide-react';

interface ParsedCvDisplayProps {
  cvData: ParseCvOutput;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }> = ({ title, icon, children, description }) => (
  <Card className="shadow-md">
    <CardHeader>
      <div className="flex items-center mb-2">
        <span className="p-2 bg-primary/10 rounded-full mr-3 text-primary">{icon}</span>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </div>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-3">
      {children}
    </CardContent>
  </Card>
);

export default function ParsedCvDisplay({ cvData }: ParsedCvDisplayProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-center text-primary tracking-tight">Your Extracted CV Information</h2>
      
      <SectionCard title="Personal Information" icon={<UserCircle size={24} />}>
        <p className="flex items-center"><UserCircle size={18} className="mr-2 text-muted-foreground" /> <strong>Name:</strong> {cvData.personalInformation.name}</p>
        {cvData.personalInformation.email && <p className="flex items-center"><Mail size={18} className="mr-2 text-muted-foreground" /> <strong>Email:</strong> {cvData.personalInformation.email}</p>}
        {cvData.personalInformation.phone && <p className="flex items-center"><Phone size={18} className="mr-2 text-muted-foreground" /> <strong>Phone:</strong> {cvData.personalInformation.phone}</p>}
        {cvData.personalInformation.linkedin && (
          <p className="flex items-center">
            <Linkedin size={18} className="mr-2 text-muted-foreground" /> 
            <strong>LinkedIn:</strong> <a href={cvData.personalInformation.linkedin} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">{cvData.personalInformation.linkedin}</a>
          </p>
        )}
        {cvData.personalInformation.github && (
          <p className="flex items-center">
            <Github size={18} className="mr-2 text-muted-foreground" /> 
            <strong>GitHub:</strong> <a href={cvData.personalInformation.github} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">{cvData.personalInformation.github}</a>
          </p>
        )}
      </SectionCard>

      {cvData.summary && (
        <SectionCard title="Summary / Objective" icon={<FileText size={24} />}>
          <p className="text-muted-foreground whitespace-pre-line">{cvData.summary}</p>
        </SectionCard>
      )}

      {cvData.experience?.length > 0 && (
        <SectionCard title="Work Experience" icon={<Briefcase size={24} />}>
          {cvData.experience.map((exp, index) => (
            <div key={index} className="py-2">
              <h4 className="font-semibold text-lg">{exp.title}</h4>
              <p className="text-sm text-muted-foreground flex items-center"><MapPin size={14} className="mr-1" /> {exp.company}</p>
              <p className="text-sm text-muted-foreground flex items-center"><CalendarDays size={14} className="mr-1" /> {exp.dates}</p>
              <p className="mt-1 text-sm whitespace-pre-line">{exp.description}</p>
              {index < cvData.experience.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </SectionCard>
      )}

      {cvData.education?.length > 0 && (
        <SectionCard title="Education" icon={<GraduationCap size={24} />}>
          {cvData.education.map((edu, index) => (
            <div key={index} className="py-2">
              <h4 className="font-semibold text-lg">{edu.degree}</h4>
              <p className="text-sm text-muted-foreground flex items-center"><MapPin size={14} className="mr-1" /> {edu.institution}</p>
              <p className="text-sm text-muted-foreground flex items-center"><CalendarDays size={14} className="mr-1" /> {edu.dates}</p>
              {edu.description && <p className="mt-1 text-sm whitespace-pre-line">{edu.description}</p>}
              {index < cvData.education.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </SectionCard>
      )}
      
      {cvData.skills?.length > 0 && (
        <SectionCard title="Skills" icon={<Sparkles size={24} />}>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, index) => (
              <span key={index} className="bg-accent/10 text-accent text-sm px-3 py-1 rounded-full font-medium">
                {skill}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {cvData.projects?.length > 0 && (
        <SectionCard title="Projects" icon={<Lightbulb size={24} />}>
          {cvData.projects.map((project, index) => (
            <div key={index} className="py-2">
              <h4 className="font-semibold text-lg">{project.name}</h4>
              <p className="mt-1 text-sm whitespace-pre-line">{project.description}</p>
              {project.url && (
                <p className="flex items-center mt-1">
                  <LinkIcon size={14} className="mr-1 text-muted-foreground" />
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm">{project.url}</a>
                </p>
              )}
              {index < cvData.projects.length - 1 && <Separator className="my-3" />}
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
}
