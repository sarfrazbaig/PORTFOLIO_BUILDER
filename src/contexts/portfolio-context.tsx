
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
  updateCvField: (path: string, value: any) => void;
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
        updateProfessionState(parsedData);
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
      updateProfessionState(newData); // Ensure profession is updated when cvData changes
    }
  };

  const setTheme: Dispatch<SetStateAction<RecommendThemeOutput | null>> = (value) => {
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

      const keys = path.split('.');
      
      const updater = (currentData: any, keysToProcess: string[]): any => {
        if (!currentData && keysToProcess.length > 0) {
          // If currentData is null/undefined but we still have keys, means path is invalid or trying to set on non-existing structure
          console.error(`Attempted to traverse through null/undefined at ${keys.join('.')} looking for ${keysToProcess[0]}`);
          return currentData; // Or initialize, but that's more complex: {} or [] depending on next key
        }

        const key = keysToProcess[0];
        const remainingKeys = keysToProcess.slice(1);
        const index = parseInt(key);

        if (remainingKeys.length === 0) { // Leaf node to update
          if (Array.isArray(currentData) && !isNaN(index) && index >= 0 ) { // index < currentData.length removed to allow adding to array
            const newArray = [...currentData];
            newArray[index] = value;
            return newArray;
          } else if (typeof currentData === 'object' && currentData !== null) {
            return { ...currentData, [key]: value };
          } else if (currentData === undefined && !isNaN(index)) { // trying to set an index on an undefined array
             const newArray = [];
             newArray[index] = value;
             return newArray;
          } else if (currentData === undefined && isNaN(index)) { // trying to set a key on an undefined object
            return { [key]: value };
          }
           else {
            console.error(`Cannot set value. Target is not an array/object or index/key is invalid. Path: ${path}, Key: ${key}`);
            return currentData;
          }
        }

        // Not at the leaf, so recurse
        if (Array.isArray(currentData) && !isNaN(index) && index >= 0 ) { // index < currentData.length removed
          const newArray = [...currentData];
          // Ensure the element at index exists before recursing, especially if it's an object/array
          const currentItem = newArray[index];
          if (typeof currentItem !== 'object' && typeof currentItem !== 'undefined' && remainingKeys.length > 0) {
            console.error(`Path segment ${key} (index ${index}) in array is not an object/array, cannot traverse further for path ${path}`);
            return newArray; // or initialize newArray[index] = {} / []
          }
          newArray[index] = updater(currentItem, remainingKeys);
          return newArray;
        } else if (typeof currentData === 'object' && currentData !== null) {
           const currentItem = currentData[key];
           if (typeof currentItem !== 'object' && typeof currentItem !== 'undefined' && currentItem !== null && remainingKeys.length > 0) {
             console.error(`Path segment ${key} in object is not an object/array, cannot traverse further for path ${path}`);
             // Initialize if necessary before recursing
             // currentData[key] = isNaN(parseInt(remainingKeys[0])) ? {} : [];
             // This part is tricky, for now, assume it exists or stop.
             return { ...currentData };
           }
          return {
            ...currentData,
            [key]: updater(currentData[key], remainingKeys),
          };
        } else {
          console.error(`Invalid path segment ${key} or non-traversable structure at ${path}. Current segment data:`, currentData);
          return currentData;
        }
      };
      const updatedData = updater(prevData, keys);
      return updatedData;
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

    