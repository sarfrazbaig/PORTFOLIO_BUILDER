
'use client';

import Link from 'next/link';
import { Briefcase, Palette, Menu, X, User, BookOpen, Sparkles, Lightbulb, HomeIcon, Moon, Sun, Edit3, Eye, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme as useNextTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PortfolioHeader() {
  const { cvData, theme, setTheme: setActiveTheme, profession, isEditMode, toggleEditMode, setCvData, availableThemes } = usePortfolioContext();
  const { theme: actualTheme, setTheme: setActualTheme } = useNextTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/portfolio', label: 'Home', icon: <HomeIcon size={18} /> },
    { href: '/portfolio/experience', label: 'Experience', icon: <Briefcase size={18} /> },
    { href: '/portfolio/education', label: 'Education', icon: <BookOpen size={18} /> },
    { href: '/portfolio/projects', label: 'Projects', icon: <Lightbulb size={18} /> },
    { href: '/portfolio/skills', label: 'Skills', icon: <Sparkles size={18} /> },
  ];

  const toggleUiTheme = () => {
    setActualTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  const handleDiscardPortfolio = () => {
    if (window.confirm('Are you sure you want to discard all portfolio data and start over? This action cannot be undone.')) {
      setCvData(null);
      setActiveTheme(null);
      localStorage.removeItem('cvPortfolioAvailableThemes'); 
      router.push('/dashboard');
    }
  };

  const handleThemeSelection = (selectedThemeName: string) => {
    const newTheme = availableThemes?.find(t => t.themeName === selectedThemeName);
    if (newTheme) {
      setActiveTheme(newTheme);
    }
    setIsMobileMenuOpen(false); 
  };

  if (!mounted) {
    return <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50 h-20" />;
  }

  // Helper function to determine if a link is active
  const isLinkActive = (href: string) => {
    if (href === '/portfolio') {
      return pathname === href; // Exact match for home
    }
    return pathname.startsWith(href); // StartsWith for other sections
  };

  return (
    <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/portfolio" className="flex items-center space-x-3 group">
              <User className="h-8 w-8 text-primary group-hover:animate-pulse transition-transform duration-300 group-hover:scale-110" />
              <div>
                <span className="font-bold text-xl tracking-tight text-foreground">
                  {cvData?.personalInformation?.name || 'Your Name'}
                </span>
                {profession && <p className="text-xs text-muted-foreground font-medium">{profession}</p>}
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link key={link.href} href={link.href} passHref>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "text-sm font-medium group flex flex-col items-center h-auto py-2 px-3 transition-all duration-200 ease-in-out hover:shadow-sm active:scale-95",
                      isActive ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <span className={cn("mb-1", isActive ? "text-primary" : "group-hover:text-primary transition-colors duration-200")}>
                      {link.icon}
                    </span>
                    <span className="text-xs">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {theme && availableThemes && availableThemes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden sm:inline-flex items-center space-x-2 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg shadow-sm text-xs font-semibold active:scale-95 transition-all duration-200" title="Switch Portfolio Theme">
                    <Palette size={16} className="text-primary/80"/>
                    <span>{theme.themeName}</span>
                    <ChevronDown size={16} className="opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Switch Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={theme.themeName} onValueChange={handleThemeSelection}>
                    {availableThemes.map((availTheme) => (
                      <DropdownMenuRadioItem key={availTheme.themeName} value={availTheme.themeName}>
                        {availTheme.themeName}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
             <Button
                variant="ghost"
                size="icon"
                onClick={toggleUiTheme}
                aria-label="Toggle UI theme"
                className="hidden md:inline-flex text-muted-foreground hover:text-primary active:scale-90 transition-all duration-200"
                title="Toggle light/dark mode"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleEditMode}
              aria-label={isEditMode ? "View Portfolio" : "Edit Portfolio"}
              className={cn(
                "text-muted-foreground hover:text-primary active:scale-90 transition-all duration-200",
                isEditMode && "bg-primary/10 text-primary border-primary/50"
                )}
              title={isEditMode ? "View Portfolio" : "Edit Portfolio"}
            >
              {isEditMode ? <Eye size={20} /> : <Edit3 size={20} />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={handleDiscardPortfolio}
              aria-label="Discard Portfolio"
              className="text-destructive-foreground bg-destructive/90 hover:bg-destructive active:scale-90 transition-all duration-200"
              title="Discard Portfolio & Start Over"
            >
              <RotateCcw size={20} />
            </Button>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="text-muted-foreground hover:text-primary active:scale-90 transition-transform duration-200"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
        
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-screen py-2 border-t border-border/50" : "max-h-0"
          )}
        >
          <nav className="flex flex-col space-y-1 pt-2">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link key={link.href} href={link.href} passHref>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start py-3 text-base active:scale-95 transition-transform duration-150 flex items-center",
                      isActive ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className={cn("mr-2", isActive ? "text-primary" : "")}>{link.icon}</span> 
                    {link.label}
                  </Button>
                </Link>
              );
            })}
             <Button
                variant="ghost"
                onClick={() => {
                  toggleUiTheme();
                  setIsMobileMenuOpen(false);
                }}
                aria-label="Toggle UI theme"
                className="w-full justify-start text-muted-foreground hover:text-primary py-3 text-base flex items-center active:scale-95 transition-transform duration-150"
                title="Toggle light/dark mode"
              >
                {actualTheme === 'light' ? <Moon size={18} className="mr-2"/> : <Sun size={18} className="mr-2"/>}
                Toggle UI Theme
              </Button>
            {theme && availableThemes && availableThemes.length > 0 && (
                 <div className="pt-2">
                    <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">Switch Portfolio Theme:</p>
                    {availableThemes.map((availTheme) => (
                        <Button
                            key={availTheme.themeName}
                            variant={theme.themeName === availTheme.themeName ? "secondary" : "ghost"}
                            className="w-full justify-start text-muted-foreground hover:text-primary py-3 text-base active:scale-95 transition-transform duration-150 flex items-center"
                            onClick={() => handleThemeSelection(availTheme.themeName)}
                        >
                            <Palette size={18} className="mr-2" /> {availTheme.themeName}
                        </Button>
                    ))}
                 </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

