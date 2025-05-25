
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { CustomThemeOutput as GenkitCustomThemeOutput } from '@/ai/flows/ai-custom-theme-generator';

const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';
const AVAILABLE_THEMES_KEY = 'cvPortfolioAvailableThemes';

export interface PortfolioTheme extends GenkitCustomThemeOutput {
  previewImageDataUri?: string;
}

interface PortfolioContextType {
  cvData: ParseCvOutput | null;
  setCvData: Dispatch<SetStateAction<ParseCvOutput | null>>;
  theme: PortfolioTheme | null;
  setTheme: Dispatch<SetStateAction<PortfolioTheme | null>>;
  availableThemes: PortfolioTheme[] | null;
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
  const [availableThemes, setAvailableThemesState] = useState<PortfolioTheme[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profession, setProfession] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    try {
      const storedCvDataString = localStorage.getItem(CV_DATA_KEY);
      if (storedCvDataString) {
        const parsedData = JSON.parse(storedCvDataString) as ParseCvOutput;
        // Ensure selectedHeaderIcon defaults if not present
        if (parsedData.personalInformation && !parsedData.personalInformation.selectedHeaderIcon) {
          parsedData.personalInformation.selectedHeaderIcon = 'User';
        }
        setCvDataState(parsedData);
        updateProfessionState(parsedData);
      } else {
         // If no CV data, ensure a default empty object with default icon for immediate use
        setCvDataState({
            personalInformation: { name: '', email: '', phone: '', linkedin: '', github: '', selectedHeaderIcon: 'User' },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: []
        } as ParseCvOutput);
      }

      const storedTheme = localStorage.getItem(THEME_RECOMMENDATION_KEY);
      if (storedTheme) {
        setThemeState(JSON.parse(storedTheme) as PortfolioTheme);
      }
      const storedAvailableThemes = localStorage.getItem(AVAILABLE_THEMES_KEY);
      if (storedAvailableThemes) {
        setAvailableThemesState(JSON.parse(storedAvailableThemes) as PortfolioTheme[]);
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      localStorage.removeItem(CV_DATA_KEY);
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
      localStorage.removeItem(AVAILABLE_THEMES_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfessionState = (data: ParseCvOutput | null) => {
    if (!data) {
        setProfession("Professional");
        return;
    }
    // Assuming customProfession is part of personalInformation now
    const personalInfo = data.personalInformation as any; // Cast to access potential customProfession
    if (personalInfo?.customProfession) {
        setProfession(personalInfo.customProfession);
    } else if (data.experience && data.experience.length > 0 && data.experience[0].title) {
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
    if (newData && newData.personalInformation && !newData.personalInformation.selectedHeaderIcon) {
      newData.personalInformation.selectedHeaderIcon = 'User'; // Ensure default
    }
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
      const { previewImageDataUri, ...themeToStore } = newValue;
      localStorage.setItem(THEME_RECOMMENDATION_KEY, JSON.stringify(themeToStore));
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
  };

  const updateCvField = (path: string, val: any) => {
    setCvDataState(prevData => {
      if (!prevData) return null;

      const keys = path.split('.');
      const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy

      let currentLevel = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKeyIsArrayIndex = !isNaN(parseInt(keys[i+1]));

        if (!currentLevel[key] || typeof currentLevel[key] !== 'object') {
          currentLevel[key] = nextKeyIsArrayIndex ? [] : {};
        }
        currentLevel = currentLevel[key];
      }
      
      const finalKey = keys[keys.length - 1];
      const finalKeyIsArrayIndex = !isNaN(parseInt(finalKey));

      if (finalKeyIsArrayIndex && Array.isArray(currentLevel)) {
        const index = parseInt(finalKey);
         if (index >= 0 && index < currentLevel.length) { // Check if index is valid
            currentLevel[index] = val;
        } else if (index === currentLevel.length && typeof val === 'object') { // Allow appending if it's an object/array
             currentLevel.push(val);
        } else {
            // Handle array index out of bounds or mismatched type for append
            console.warn(`updateCvField: Index ${index} out of bounds for array or invalid type for push at path ${path}`);
        }
      } else if (!Array.isArray(currentLevel) && typeof currentLevel === 'object' && currentLevel !== null) {
        currentLevel[finalKey] = val;
      } else {
         console.warn(`updateCvField: Cannot set property '${finalKey}' on non-object or array at path ${path}`);
      }
      
      if (path.startsWith('personalInformation.selectedHeaderIcon') && !newData.personalInformation.selectedHeaderIcon) {
         newData.personalInformation.selectedHeaderIcon = 'User';
      }

      return newData;
    });
  };
  
  return (
    <PortfolioContext.Provider value={{ cvData, setCvData, theme, setTheme, availableThemes, isLoading, profession, isEditMode, toggleEditMode, updateCvField }}>
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
