"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/messages/en.json";
import nl from "@/messages/nl.json";
import fr from "@/messages/fr.json";

const messages = { en, nl, fr };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Langue par défaut : français
  const [locale, setLocale] = useState("fr");

  useEffect(() => {
    const savedLocale = localStorage.getItem("app-locale");
    if (savedLocale && messages[savedLocale]) {
      setLocale(savedLocale);
    }
  }, []);

  const changeLanguage = (newLocale) => {
    if (messages[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem("app-locale", newLocale);
    }
  };

  const t = (key) => {
    const keys = key.split(".");
    let value = messages[locale];
    for (const k of keys) {
      if (value[k]) {
        value = value[k];
      } else {
        return key; // Retourne la clé si pas trouvé
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
