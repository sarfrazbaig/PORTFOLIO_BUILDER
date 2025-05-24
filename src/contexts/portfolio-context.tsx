
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { CustomThemeOutput, CustomThemeVariables as GenkitCustomThemeVariables } from '@/ai/flows/ai-custom-theme-generator';

const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';

// Extend GenkitCustomThemeVariables for internal use if needed, or use as is
export interface CustomThemeVariables extends GenkitCustomThemeVariables {}

export interface PortfolioTheme extends Partial<CustomThemeOutput> {
  themeName: string; 
  reason?: string; 
  themeVariables?: CustomThemeVariables; 
  previewImagePrompt?: string;
  previewImageDataUri?: string; // Added to store dashboard generated image
}

interface PortfolioContextType {
  cvData: ParseCvOutput | null;
  setCvData: Dispatch<SetStateAction<ParseCvOutput | null>>;
  theme: PortfolioTheme | null;
  setTheme: Dispatch<SetStateAction<PortfolioTheme | null>>;
  isLoading: boolean;
  profession: string | null;
  isEditMode: boolean;
  toggleEditMode: () => void;
  updateCvField: (path: string, value: any) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvDataState] = useState<ParseCvOutput | null>(null);
  const [theme, setThemeState] = useState<PortfolioTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profession, setProfession] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    try {
      const storedCvData = localStorage.getItem(CV_DATA_KEY);
      if (storedCvData) {
        const parsedData = JSON.parse(storedCvData) as ParseCvOutput;
        setCvDataState(parsedData);
        updateProfessionState(parsedData);
      }
      const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);
      if (storedTheme) {
        setThemeState(JSON.parse(storedTheme) as PortfolioTheme);
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      localStorage.removeItem(CV_DATA_KEY);
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfessionState = (data: ParseCvOutput | null) => {
    if (!data) {
        setProfession("Professional");
        return;
    }
    if (data.experience && data.experience.length > 0 && data.experience[0].title) {
        setProfession(data.experience[0].title);
    } else if (data.summary) {
        const summaryWords = data.summary.toLowerCase().split(' ');
        const commonTitles = ['engineer', 'developer', 'designer', 'manager', 'analyst', 'specialist', 'consultant', 'architect', 'professional', 'artist', 'writer', 'researcher'];
        let inferredProfession = '';
        for (const title of commonTitles) {
            if (summaryWords.includes(title)) {
                inferredProfession = title.charAt(0).toUpperCase() + title.slice(1);
                break;
            }
        }
        setProfession(inferredProfession || "Professional");
    } else {
        setProfession("Professional");
    }
  };

  const setCvData: Dispatch<SetStateAction<ParseCvOutput | null>> = (value) => {
    const newData = typeof value === 'function' ? value(cvData) : value;
    setCvDataState(newData);
    if (newData === null) {
      localStorage.removeItem(CV_DATA_KEY);
    } else {
      localStorage.setItem(CV_DATA_KEY, JSON.stringify(newData));
      updateProfessionState(newData);
    }
  };

  const setTheme: Dispatch<SetStateAction<PortfolioTheme | null>> = (value) => {
    const newValue = typeof value === 'function' ? value(theme) : value;
    setThemeState(newValue);
     if (newValue === null) {
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
    } else {
      localStorage.setItem(THEME_RECOMMENDATION_KEY, JSON.stringify(newValue));
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const updateCvField = (path: string, value: any) => {
    setCvData(prevData => {
      if (!prevData) return null;
      
      // Create a deep copy to ensure immutability
      const newData = JSON.parse(JSON.stringify(prevData));
      
      const keys = path.split('.');
      let current = newData;
  
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKeyIsNumber = !isNaN(parseInt(keys[i+1]));
  
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = nextKeyIsNumber ? [] : {};
        }
        current = current[key];
      }
      
      const finalKey = keys[keys.length - 1];
      const finalKeyIsNumber = !isNaN(parseInt(finalKey));

      if (finalKeyIsNumber && Array.isArray(current)) {
        current[parseInt(finalKey)] = value;
      } else {
        current[finalKey] = value;
      }
      
      return newData;
    });
  };
  
  return (
    <PortfolioContext.Provider value={{ cvData, setCvData, theme, setTheme, isLoading, profession, isEditMode, toggleEditMode, updateCvField }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
}

    