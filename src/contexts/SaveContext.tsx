/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type SaveHandlerRecord = {
  handler: () => void;
  getIsValid?: () => boolean;
  getIsSubmitting?: () => boolean;
} | null;

type SaveContextValue = {
  registerSaveHandler: (h: () => void, getters?: { getIsValid?: () => boolean; getIsSubmitting?: () => boolean }) => void;
  unregisterSaveHandler: () => void;
  triggerSave: () => void;
  // metaVersion changes whenever a registration or its getters are updated so consumers can re-render
  metaVersion: number;
  // read current meta
  getMeta: () => { isValid: boolean; isSubmitting: boolean };
};

const SaveContext = createContext<SaveContextValue | undefined>(undefined);

export function SaveProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<SaveHandlerRecord>(null);
  const [metaVersion, setMetaVersion] = useState(0);

  const registerSaveHandler = (h: () => void, getters?: { getIsValid?: () => boolean; getIsSubmitting?: () => boolean }) => {
    handlerRef.current = { handler: h, getIsValid: getters?.getIsValid, getIsSubmitting: getters?.getIsSubmitting };
    // registration updated
    setMetaVersion((v) => v + 1);
  };

  const unregisterSaveHandler = () => {
    handlerRef.current = null;
    setMetaVersion((v) => v + 1);
  };

  const triggerSave = () => {
    if (handlerRef.current && handlerRef.current.handler) handlerRef.current.handler();
  };

  const getMeta = () => {
    const cur = handlerRef.current;
    try {
      const isValid = cur?.getIsValid ? Boolean(cur.getIsValid()) : true;
      const isSubmitting = cur?.getIsSubmitting ? Boolean(cur.getIsSubmitting()) : false;
      // minimal log for diagnostics — will be removed after debugging
      if (typeof console !== 'undefined' && typeof console.info === 'function') {
        console.info('[SaveContext] getMeta called -> isValid:', isValid, 'isSubmitting:', isSubmitting);
      }
      return { isValid, isSubmitting };
    } catch {
      return { isValid: false, isSubmitting: false };
    }
  };

  return (
    <SaveContext.Provider value={{ registerSaveHandler, unregisterSaveHandler, triggerSave, metaVersion, getMeta }}>
      {children}
    </SaveContext.Provider>
  );
}

export function useSave() {
  const ctx = useContext(SaveContext);
  if (!ctx) throw new Error('useSave must be used within a SaveProvider');
  return ctx;
}

export default SaveContext;
