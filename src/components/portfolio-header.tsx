
'use client';

import Link from 'next/link';
import { Palette, Menu, X, Edit3, Eye, RotateCcw, ChevronDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolioContext } from '@/contexts/portfolio-context';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme as useNextTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navLinks } from '@/lib/navlinks'; // Assuming navlinks are moved here
import { renderIcon } from '@/lib/icons';
import HeaderIconSelectorDialog from './header-icon-selector-dialog'; // New Dialog

export default function PortfolioHeader() {
  const {
    cvData,
    theme,
    setTheme: setActiveTheme,
    profession,
    isEditMode,
    toggleEditMode,
    setCvData,
    updateCvField,
    availableThemes,
  } = usePortfolioContext();
  const { theme: actualTheme, setTheme: setActualTheme } = useNextTheme(); // For UI light/dark
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handlePortfolioThemeSelection = (selectedThemeName: string) => {
    const newTheme = availableThemes?.find(t => t.themeName === selectedThemeName);
    if (newTheme) {
      setActiveTheme(newTheme);
    }
    setIsMobileMenuOpen(false);
  };

  const handleHeaderIconSelect = (iconName: string) => {
    updateCvField('personalInformation.selectedHeaderIcon', iconName);
  };

  const currentHeaderIconName = cvData?.personalInformation?.selectedHeaderIcon || 'User';

  if (!mounted) {
    return <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50 h-20" />;
  }

  const isLinkActive = (href: string) => {
    if (href === '/portfolio') return pathname === href;
    return pathname.startsWith(href);
  };

  const UiThemeIcon = actualTheme === 'light' ? Moon : Sun;

  return (
    <>
      <header className="bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center">
              <Link href="/portfolio" className="flex items-center space-x-3 group relative">
                <div className="relative">
                  {renderIcon(currentHeaderIconName, {
                    className: "h-8 w-8 text-primary group-hover:animate-pulse transition-transform duration-300 group-hover:scale-110",
                  })}
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-3 h-6 w-6 p-0.5 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-primary shadow-md active:scale-90 transition-all"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent Link navigation
                        setIsIconSelectorOpen(true);
                      }}
                      title="Change Header Icon"
                    >
                      <Pencil size={12} />
                    </Button>
                  )}
                </div>
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
                  <Link key={link.href} href={link.href} passHref legacyBehavior>
                    <Button
                      as="a"
                      variant="ghost"
                      className={cn(
                        "text-sm font-medium group flex flex-col items-center h-auto py-2 px-3 transition-all duration-200 ease-in-out hover:shadow-sm active:scale-95",
                        isActive ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <span className={cn("mb-1", isActive ? "text-primary" : "group-hover:text-primary transition-colors duration-200")}>
                        {renderIcon(link.iconName, {size: 18})}
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
                      <Palette size={16} className="text-primary/80" />
                      <span className="truncate max-w-[100px]">{theme.themeName}</span>
                      <ChevronDown size={16} className="opacity-70 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                    <DropdownMenuLabel>Switch Portfolio Theme</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={theme.themeName} onValueChange={handlePortfolioThemeSelection}>
                      {availableThemes.map((availTheme) => (
                        <DropdownMenuRadioItem key={availTheme.themeName} value={availTheme.themeName} className="truncate">
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
                <UiThemeIcon size={20} />
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
              isMobileMenuOpen ? "max-h-[calc(100vh-5rem)] overflow-y-auto py-2 border-t border-border/50" : "max-h-0"
            )}
          >
            <nav className="flex flex-col space-y-1 pt-2">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link key={link.href} href={link.href} passHref legacyBehavior>
                    <Button
                      as="a"
                      variant="ghost"
                      className={cn(
                        "w-full justify-start py-3 text-base active:scale-95 transition-transform duration-150 flex items-center",
                        isActive ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-primary"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className={cn("mr-3", isActive ? "text-primary" : "")}>{renderIcon(link.iconName, {size: 20})}</span>
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
                <UiThemeIcon size={20} className="mr-3"/>
                Toggle UI Theme
              </Button>
              {theme && availableThemes && availableThemes.length > 0 && (
                <div className="pt-2 border-t mt-1">
                  <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">Switch Portfolio Theme:</p>
                  {availableThemes.map((availTheme) => (
                    <Button
                      key={availTheme.themeName}
                      variant={theme.themeName === availTheme.themeName ? "secondary" : "ghost"}
                      className="w-full justify-start text-muted-foreground hover:text-primary py-3 text-base active:scale-95 transition-transform duration-150 flex items-center"
                      onClick={() => handlePortfolioThemeSelection(availTheme.themeName)}
                    >
                      <Palette size={20} className="mr-3" /> {availTheme.themeName}
                    </Button>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      <HeaderIconSelectorDialog
        isOpen={isIconSelectorOpen}
        onOpenChange={setIsIconSelectorOpen}
        currentIconName={currentHeaderIconName}
        onIconSelect={handleHeaderIconSelect}
      />
    </>
  );
}
