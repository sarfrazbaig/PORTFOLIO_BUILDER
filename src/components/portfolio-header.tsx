
'use client';

import Link from 'next/link';
import { Briefcase, Palette, Menu, X, User, BookOpen, Sparkles, Lightbulb, HomeIcon, Moon, Sun, Edit3, Eye } from 'lucide-react'; // Added Edit3, Eye
import { Button } from '@/components/ui/button';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme as useNextTheme } from 'next-themes';

export default function PortfolioHeader() {
  const { cvData, theme, profession, isEditMode, toggleEditMode } = usePortfolioContext(); // Added isEditMode, toggleEditMode
  const { theme: actualTheme, setTheme: setActualTheme } = useNextTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const navLinks = [
    { href: '/portfolio', label: 'Home', icon: <HomeIcon size={18} className="mr-2 md:mr-0 md:mb-1 group-hover:text-primary transition-colors" /> },
    { href: '/portfolio/experience', label: 'Experience', icon: <Briefcase size={18} className="mr-2 md:mr-0 md:mb-1 group-hover:text-primary transition-colors" /> },
    { href: '/portfolio/education', label: 'Education', icon: <BookOpen size={18} className="mr-2 md:mr-0 md:mb-1 group-hover:text-primary transition-colors" /> },
    { href: '/portfolio/projects', label: 'Projects', icon: <Lightbulb size={18} className="mr-2 md:mr-0 md:mb-1 group-hover:text-primary transition-colors" /> },
    { href: '/portfolio/skills', label: 'Skills', icon: <Sparkles size={18} className="mr-2 md:mr-0 md:mb-1 group-hover:text-primary transition-colors" /> },
  ];

  const toggleTheme = () => {
    setActualTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50 h-20" />;
  }

  return (
    <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/portfolio" className="flex items-center space-x-3 group">
              <User className="h-8 w-8 text-primary group-hover:animate-pulse" />
              <div>
                <span className="font-bold text-xl tracking-tight text-foreground">
                  {cvData?.personalInformation?.name || 'Your Name'}
                </span>
                {profession && <p className="text-xs text-muted-foreground font-medium">{profession}</p>}
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} passHref>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 group flex flex-col items-center h-auto py-2 px-3">
                  {link.icon}
                  <span className="text-xs">{link.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-2">
            {theme && (
              <div className="hidden sm:flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg shadow-sm">
                <Palette size={16} className="text-primary/80"/>
                <span className="text-xs font-semibold text-primary">{theme.themeName} Theme</span>
              </div>
            )}
             <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="hidden md:inline-flex text-muted-foreground hover:text-primary"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleEditMode}
              aria-label={isEditMode ? "View Portfolio" : "Edit Portfolio"}
              className="text-muted-foreground hover:text-primary"
              title={isEditMode ? "View Portfolio" : "Edit Portfolio"}
            >
              {isEditMode ? <Eye size={20} /> : <Edit3 size={20} />}
            </Button>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="text-muted-foreground hover:text-primary"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-screen py-2 border-t border-border/50" : "max-h-0"
          )}
        >
          <nav className="flex flex-col space-y-1 pt-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} passHref>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-primary py-3 text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon} {link.label}
                </Button>
              </Link>
            ))}
             <Button
                variant="ghost"
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                aria-label="Toggle theme"
                className="w-full justify-start text-muted-foreground hover:text-primary py-3 text-base flex items-center"
              >
                {actualTheme === 'light' ? <Moon size={18} className="mr-2"/> : <Sun size={18} className="mr-2"/>}
                Toggle Theme
              </Button>
            {theme && (
              <div className="sm:hidden flex items-center space-x-2 bg-primary/10 px-3 py-2 rounded-lg shadow-sm mt-2 text-sm">
                <Palette size={16} className="text-primary/80"/>
                <span className="font-semibold text-primary">{theme.themeName} Theme</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
