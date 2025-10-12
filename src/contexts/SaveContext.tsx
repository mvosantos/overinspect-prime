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
  // No polling here — callers should re-register when their validity/submitting state changes.

  const registerSaveHandler = (h: () => void, getters?: { getIsValid?: () => boolean; getIsSubmitting?: () => boolean }) => {
    const prev = handlerRef.current;
  const next = { handler: h, getIsValid: getters?.getIsValid, getIsSubmitting: getters?.getIsSubmitting } as SaveHandlerRecord;
  const sameHandler = prev?.handler === (next as NonNullable<SaveHandlerRecord>).handler;
  const sameGetIsValid = prev?.getIsValid === (next as NonNullable<SaveHandlerRecord>).getIsValid;
  const sameGetIsSubmitting = prev?.getIsSubmitting === (next as NonNullable<SaveHandlerRecord>).getIsSubmitting;
    handlerRef.current = next;
    if (!prev || !sameHandler || !sameGetIsValid || !sameGetIsSubmitting) {
      setMetaVersion((v) => v + 1);
    }
  };

  const unregisterSaveHandler = () => {
    if (handlerRef.current) {
      handlerRef.current = null;
      setMetaVersion((v) => v + 1);
    }
  };

  const triggerSave = () => {
    if (handlerRef.current && handlerRef.current.handler) handlerRef.current.handler();
  };

  const getMeta = () => {
    const cur = handlerRef.current;
    try {
      const isValid = cur?.getIsValid ? Boolean(cur.getIsValid()) : true;
      const isSubmitting = cur?.getIsSubmitting ? Boolean(cur.getIsSubmitting()) : false;
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
