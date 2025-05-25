
import {
  User, Briefcase, Code2, Palette, PenTool, Sparkles, Anchor, Aperture, Atom, Award, Feather,
  GitBranch, Globe2, Heart, Hexagon, Layers, Leaf, LifeBuoy, Mountain, Star, Sun, Target, Wind, Zap, Settings2, Rocket, Bot, Brain, Brush, Camera, Component, Compass, DraftingCompass, Database, Diamond, Droplets, Earth, Eye, Fingerprint, Flag, FlaskConical, FolderOpen, Gamepad2, Gem, GitFork, GithubIcon, GraduationCap, Home, Image, Infinity, Keyboard, Languages, LayoutGrid, Library, Lightbulb, Link, ListChecks, Mail, MapPin, MessageCircle, Mic2, Moon, MousePointer2, Music2, Navigation, Package, Paperclip, Pencil, Phone, PieChart, Pin, Plane, Plug, Pocket, Podcast, Power, Presentation, Printer, Puzzle, QrCode, Quote, Ratio, Redo2, Router, Rss, Scale, ScanLine, School, Search, Send, Server, Shapes, Share2, Shield, ShoppingBag, Smartphone, Smile, Snowflake, Speaker, SquareTerminal, Sticker, Store, Tablet, Tag, Tent, Terminal, ThumbsUp, Ticket, ToggleLeft, Tool, Tractor, Train, Trash2, TrendingUp, Triangle, Trophy, Truck, Tv2, Twitch, Twitter, Undo2, Unlink2, UploadCloud, Usb, Video, Voicemail, Volume2, Wallet, Wand2, Watch, Webcam, Wifi, Wine, Wrench, Youtube, ZoomIn, ZoomOut
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';

interface IconListItem {
  name: string;
  component: React.FC<LucideProps>;
  tags?: string[];
}

// To add more icons, import them above and add to this list.
export const iconList: IconListItem[] = [
  { name: 'User', component: User, tags: ['person', 'profile', 'avatar'] },
  { name: 'Briefcase', component: Briefcase, tags: ['work', 'job', 'business', 'portfolio'] },
  { name: 'Code2', component: Code2, tags: ['develop', 'software', 'programming', 'code'] },
  { name: 'Palette', component: Palette, tags: ['design', 'art', 'color', 'creative'] },
  { name: 'PenTool', component: PenTool, tags: ['write', 'draw', 'design', 'edit'] },
  { name: 'Sparkles', component: Sparkles, tags: ['idea', 'magic', 'ai', 'creative', 'feature'] },
  { name: 'Rocket', component: Rocket, tags: ['launch', 'project', 'startup', 'innovation'] },
  { name: 'Lightbulb', component: Lightbulb, tags: ['idea', 'innovation', 'thought'] },
  { name: 'Atom', component: Atom, tags: ['science', 'tech', 'physics', 'future'] },
  { name: 'Award', component: Award, tags: ['achievement', 'recognition', 'prize'] },
  { name: 'Feather', component: Feather, tags: ['light', 'write', 'soft', 'author'] },
  { name: 'GitBranch', component: GitBranch, tags: ['code', 'version', 'develop'] },
  { name: 'Globe2', component: Globe2, tags: ['world', 'international', 'travel', 'web'] },
  { name: 'Heart', component: Heart, tags: ['love', 'passion', 'favorite'] },
  { name: 'Hexagon', component: Hexagon, tags: ['shape', 'tech', 'modern', 'block'] },
  { name: 'Layers', component: Layers, tags: ['stack', 'design', 'develop', 'framework'] },
  { name: 'Leaf', component: Leaf, tags: ['nature', 'growth', 'eco', 'organic'] },
  { name: 'Mountain', component: Mountain, tags: ['challenge', 'peak', 'adventure', 'nature'] },
  { name: 'Star', component: Star, tags: ['favorite', 'rating', 'achievement', 'quality'] },
  { name: 'Sun', component: Sun, tags: ['light', 'bright', 'day', 'energy'] },
  { name: 'Target', component: Target, tags: ['goal', 'aim', 'focus', 'objective'] },
  { name: 'Zap', component: Zap, tags: ['energy', 'fast', 'power', 'electric'] },
  { name: 'Settings2', component: Settings2, tags: ['config', 'options', 'tools', 'setup'] },
  { name: 'Bot', component: Bot, tags: ['ai', 'robot', 'automation', 'chatbot'] },
  { name: 'Brain', component: Brain, tags: ['think', 'mind', 'intelligence', 'idea'] },
  { name: 'Brush', component: Brush, tags: ['art', 'paint', 'design', 'creative'] },
  { name: 'Camera', component: Camera, tags: ['photo', 'image', 'media'] },
  { name: 'Component', component: Component, tags: ['module', 'part', 'block', 'ui'] },
  { name: 'Compass', component: Compass, tags: ['direction', 'navigation', 'explore'] },
  { name: 'DraftingCompass', component: DraftingCompass, tags: ['design', 'architecture', 'precise'] },
];

const iconComponents: { [key: string]: React.FC<LucideProps> } = {};
iconList.forEach(icon => {
  iconComponents[icon.name] = icon.component;
});

export const renderIcon = (
  iconName?: string | null,
  props?: LucideProps
): JSX.Element => {
  const IconComponent = iconName ? iconComponents[iconName] : null;
  if (IconComponent) {
    return <IconComponent {...props} />;
  }
  // Fallback to User icon if no name provided or name not found
  return <User {...props} />;
};
