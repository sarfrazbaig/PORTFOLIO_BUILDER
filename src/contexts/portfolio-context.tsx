
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ParseCvOutput } from '@/ai/flows/cv-parser';
import type { CustomThemeOutput as GenkitCustomThemeOutput, CustomThemeVariables } from '@/ai/flows/ai-custom-theme-generator';

const CV_DATA_KEY = 'cvPortfolioData';
const THEME_RECOMMENDATION_KEY = 'cvPortfolioTheme';
const AVAILABLE_THEMES_KEY = 'cvPortfolioAvailableThemes';

export interface PortfolioTheme extends GenkitCustomThemeOutput {
  previewImageDataUri?: string;
}

// A more minimal version of the theme for storing the active theme
interface ActiveThemeForStorage {
  themeName: string;
  description: string; // Keeping description as it might be used in portfolio header/footer
  themeVariables: CustomThemeVariables;
  previewImagePrompt: string; // Keep prompt for potential re-generation context if needed
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
    setIsLoading(true);
    try {
      const storedCvDataString = localStorage.getItem(CV_DATA_KEY);
      if (storedCvDataString) {
        const parsedData = JSON.parse(storedCvDataString) as ParseCvOutput;
        if (parsedData.personalInformation && !parsedData.personalInformation.selectedHeaderIcon) {
          parsedData.personalInformation.selectedHeaderIcon = 'User';
        }
        setCvDataState(parsedData);
        updateProfessionState(parsedData);
      } else {
        setCvDataState({
            personalInformation: { name: '', email: '', phone: '', linkedin: '', github: '', selectedHeaderIcon: 'User' },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: []
        } as ParseCvOutput);
        updateProfessionState(null);
      }

      const storedActiveThemeString = localStorage.getItem(THEME_RECOMMENDATION_KEY);
      if (storedActiveThemeString) {
        // The stored active theme is minimal, reconstruct to PortfolioTheme for state
        const storedMinimalTheme = JSON.parse(storedActiveThemeString) as ActiveThemeForStorage;
        const fullActiveTheme: PortfolioTheme = {
          themeName: storedMinimalTheme.themeName,
          description: storedMinimalTheme.description,
          themeVariables: storedMinimalTheme.themeVariables,
          previewImagePrompt: storedMinimalTheme.previewImagePrompt,
          previewImageDataUri: undefined, // This was not stored
        };
        setThemeState(fullActiveTheme);
      }

      const storedAvailableThemesString = localStorage.getItem(AVAILABLE_THEMES_KEY);
      if (storedAvailableThemesString) {
        // Themes stored by dashboard have 'imageDataUri', map to 'previewImageDataUri'
        const rawAvailableThemes = JSON.parse(storedAvailableThemesString) as Array<GenkitCustomThemeOutput & { imageDataUri?: string; error?: string; isLoadingImage?:boolean /* dashboard state keys */ }>;
        const mappedAvailableThemes: PortfolioTheme[] = rawAvailableThemes.map(rawTheme => ({
          themeName: rawTheme.themeName,
          description: rawTheme.description,
          themeVariables: rawTheme.themeVariables,
          previewImagePrompt: rawTheme.previewImagePrompt,
          previewImageDataUri: rawTheme.imageDataUri, // Correct mapping
        }));
        setAvailableThemesState(mappedAvailableThemes);
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
    const personalInfo = data.personalInformation as any; 
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
      newData.personalInformation.selectedHeaderIcon = 'User'; 
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
    setThemeState(newValue); // Keep the full theme in React state
     if (newValue === null) {
      localStorage.removeItem(THEME_RECOMMENDATION_KEY);
    } else {
      // Store only essential parts for the active theme to avoid quota issues
      const themeToStore: ActiveThemeForStorage = {
        themeName: newValue.themeName,
        description: newValue.description,
        themeVariables: newValue.themeVariables,
        previewImagePrompt: newValue.previewImagePrompt,
        // DO NOT store previewImageDataUri here
      };
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
      let currentLevel = JSON.parse(JSON.stringify(prevData)); // Deep copy
      const originalData = currentLevel;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKeyIsArrayIndex = !isNaN(parseInt(keys[i+1]));

        if (!currentLevel[key] || typeof currentLevel[key] !== 'object') {
          currentLevel[key] = nextKeyIsArrayIndex ? [] : {};
        }
        currentLevel = currentLevel[key];
      }
      
      const finalKey = keys[keys.length - 1];
      currentLevel[finalKey] = val;
      
      if (path.startsWith('personalInformation.selectedHeaderIcon') && !originalData.personalInformation.selectedHeaderIcon) {
         originalData.personalInformation.selectedHeaderIcon = 'User';
      }
      return originalData;
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
