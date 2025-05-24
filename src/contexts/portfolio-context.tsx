
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
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvDataState] = useState<ParseCvOutput | null>(null);
  const [theme, setThemeState] = useState<RecommendThemeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profession, setProfession] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedCvData = localStorage.getItem(CV_DATA_KEY);
      if (storedCvData) {
        const parsedData = JSON.parse(storedCvData) as ParseCvOutput;
        setCvDataState(parsedData);
         if (parsedData.experience && parsedData.experience.length > 0) {
          setProfession(parsedData.experience[0].title);
        } else if (parsedData.summary) {
            const summaryWords = parsedData.summary.toLowerCase().split(' ');
            const commonTitles = ['engineer', 'developer', 'designer', 'manager', 'analyst', 'specialist', 'consultant', 'architect', 'professional'];
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
      }
      const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);
      if (storedTheme) {
        setThemeState(JSON.parse(storedTheme));
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      // Clear potentially corrupted data
      localStorage.removeItem(CV_DATA_KEY);
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCvData: Dispatch<SetStateAction<ParseCvOutput | null>> = (value) => {
    setCvDataState(value);
    if (value === null) {
      localStorage.removeItem(CV_DATA_KEY);
    } else {
      localStorage.setItem(CV_DATA_KEY, JSON.stringify(value));
       // Re-derive profession when CV data changes
      if (typeof value === 'function') {
        // If value is a function, we'd need to compute the new state first
        // This case is less common for direct setting but good to be aware of
        setCvDataState(prevState => {
          const newState = value(prevState);
          if (newState?.experience && newState.experience.length > 0) {
            setProfession(newState.experience[0].title);
          } else {
            setProfession("Professional"); // Default or infer from summary
          }
          return newState;
        });
      } else if (value?.experience && value.experience.length > 0) {
        setProfession(value.experience[0].title);
      } else {
        setProfession("Professional"); // Default or infer from summary
      }
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
  

  return (
    <PortfolioContext.Provider value={{ cvData, setCvData, theme, setTheme, isLoading, profession }}>
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
