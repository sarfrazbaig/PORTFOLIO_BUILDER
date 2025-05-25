
'use client';

import { useState } from 'react';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, XCircle, PlusCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SkillsPage() {
  const { cvData, isEditMode, setCvData } = usePortfolioContext();
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (!newSkill.trim() || !cvData) return;
    const updatedSkills = [...(cvData.skills || []), newSkill.trim()];
    setCvData({ ...cvData, skills: updatedSkills });
    setNewSkill('');
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    if (!cvData || !cvData.skills) return;
    const updatedSkills = cvData.skills.filter(skill => skill !== skillToDelete);
    setCvData({ ...cvData, skills: updatedSkills });
  };

  const animationDelay = (index: number) => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700'];
    return delays[index % delays.length];
  };

  if (!cvData || !cvData.skills || (cvData.skills.length === 0 && !isEditMode)) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Card className="max-w-2xl mx-auto shadow-md border-l-4 border-accent animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center">
              <Info size={24} className="mr-3 text-accent" />
              <CardTitle className="text-xl text-accent">No Skills Found</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We couldn&apos;t find any skills in your CV data.
              {isEditMode ? " You can add skills below." : " Please upload a CV with skills or add them in edit mode."}
            </p>
             {isEditMode && (
                <div className="mt-6">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      placeholder="Enter a new skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-grow"
                    />
                    <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
                      <PlusCircle size={18} className="mr-2" /> Add Skill
                    </Button>
                  </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { skills = [] } = cvData; // Default to empty array if skills is null/undefined

  return (
    <div className="container mx-auto py-12 md:py-16 px-6">
      <section id="skills">
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
            <Sparkles size={40} className="mr-4"/>Skills & Expertise
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            A showcase of my technical and professional abilities.
          </p>
        </div>
        <Card className="shadow-xl border-l-4 border-primary/70 bg-card/90 backdrop-blur-sm max-w-3xl mx-auto animate-fade-in-up delay-100">
          <CardHeader className="p-6 md:p-8 bg-muted/20">
            <CardTitle className="text-xl md:text-2xl text-primary">My Core Competencies</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {skills.length === 0 && isEditMode && (
                 <p className="text-muted-foreground text-center mb-4">No skills listed yet. Add your first skill below.</p>
            )}
            {skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-5">
                {skills.map((skill, index) => (
                    <div key={index} className={cn("relative group animate-fade-in-up", animationDelay(index))}>
                    <span 
                        className="bg-accent/10 text-accent text-md md:text-lg font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-accent/20 transition-all cursor-default transform hover:scale-105 block"
                    >
                        {skill}
                    </span>
                    {isEditMode && (
                        <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteSkill(skill)}
                        aria-label={`Delete skill ${skill}`}
                        >
                        <XCircle size={18} />
                        </Button>
                    )}
                    </div>
                ))}
                </div>
            )}

            {isEditMode && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3">Add New Skill</h3>
                <div className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="e.g., React, Project Management"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-grow"
                  />
                  <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
                    <PlusCircle size={18} className="mr-2" /> Add Skill
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
