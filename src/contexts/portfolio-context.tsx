
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { RecommendThemeOutput } from '@/ai/flows/ai-theme-recommendation';

const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';

interface PortfolioContextType {
  cvData: ParseCvOutput | null;
  setCvData: Dispatch<SetStateAction<ParseCvOutput | null>>;
  theme: RecommendThemeOutput | null;
  setTheme: Dispatch<SetStateAction<RecommendThemeOutput | null>>;
  isLoading: boolean;
  profession: string | null;
  isEditMode: boolean;
  toggleEditMode: () => void;
  updateCvField: (path: string, value: any) => void; // For more granular updates
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvDataState] = useState<ParseCvOutput | null>(null);
  const [theme, setThemeState] = useState<RecommendThemeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profession, setProfession] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    try {
      const storedCvData = localStorage.getItem(CV_DATA_KEY);
      if (storedCvData) {
        const parsedData = JSON.parse(storedCvData) as ParseCvOutput;
        setCvDataState(parsedData);
        updateProfession(parsedData);
      }
      const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);
      if (storedTheme) {
        setThemeState(JSON.parse(storedTheme));
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      localStorage.removeItem(CV_DATA_KEY);
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfession = (data: ParseCvOutput | null) => {
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
      updateProfession(newData);
    }
  };

  const setTheme: Dispatch<SetStateAction<RecommendThemeOutput | null>> = (value) => {
    setThemeState(value);
     if (value === null) {
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
    } else {
      localStorage.setItem(THEME_RECOMMENDATION_KEY, JSON.stringify(value));
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const updateCvField = (path: string, value: any) => {
    setCvData(prevData => {
      if (!prevData) return null;
      const keys = path.split('.');
      let currentLevel = { ...prevData };
      let tempRef: any = currentLevel;

      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          tempRef[key] = value;
        } else {
          if (!tempRef[key] || typeof tempRef[key] !== 'object') {
            tempRef[key] = {}; // Create path if it doesn't exist
          }
          tempRef = tempRef[key];
        }
      });
      return currentLevel;
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
