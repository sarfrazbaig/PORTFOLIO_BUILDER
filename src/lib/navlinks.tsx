
// For simplicity, using icon names as strings.
// The PortfolioHeader will use a helper to render actual Lucide components.

export interface NavLinkInfo {
  href: string;
  label: string;
  iconName: string; // Name of the lucide-react icon
}

export const navLinks: NavLinkInfo[] = [
  { href: '/portfolio', label: 'Home', iconName: 'Home' },
  { href: '/portfolio/experience', label: 'Experience', iconName: 'Briefcase' },
  { href: '/portfolio/education', label: 'Education', iconName: 'GraduationCap' },
  { href: '/portfolio/projects', label: 'Projects', iconName: 'Lightbulb' },
  { href: '/portfolio/skills', label: 'Skills', iconName: 'Sparkles' },
];
