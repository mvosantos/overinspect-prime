/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useRef, useState } from 'react';

type AttachItem = Record<string, unknown>;

type DraftStore = Map<string, AttachItem[]>;

type AttachmentsDraftContextValue = {
  getDraft: (serviceTypeId?: string | null) => AttachItem[] | undefined;
  setDraft: (serviceTypeId: string | null | undefined, items: AttachItem[] | undefined) => void;
  clearDraft: (serviceTypeId?: string | null) => void;
  addAttachment: (serviceTypeId: string | null | undefined, item: AttachItem) => void;
  removeAttachment: (serviceTypeId: string | null | undefined, index: number) => void;
};

const AttachmentsDraftContext = createContext<AttachmentsDraftContextValue | null>(null);

export function AttachmentsDraftProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<DraftStore>(new Map());
  const [, setTick] = useState(0); // force updates when needed

  const keyFor = (id?: string | null) => id ?? 'default';

  const getDraft = (serviceTypeId?: string | null) => {
    return storeRef.current.get(keyFor(serviceTypeId));
  };

  const setDraft = (serviceTypeId: string | null | undefined, items: AttachItem[] | undefined) => {
    const k = keyFor(serviceTypeId);
    if (!items || items.length === 0) {
      storeRef.current.delete(k);
    } else {
      storeRef.current.set(k, items.slice());
    }
    setTick((v) => v + 1);
  };

  const clearDraft = (serviceTypeId?: string | null) => {
    storeRef.current.delete(keyFor(serviceTypeId));
    setTick((v) => v + 1);
  };

  const addAttachment = (serviceTypeId: string | null | undefined, item: AttachItem) => {
    const k = keyFor(serviceTypeId);
    const arr = storeRef.current.get(k) ?? [];
    arr.push(item);
    storeRef.current.set(k, arr);
    setTick((v) => v + 1);
  };

  const removeAttachment = (serviceTypeId: string | null | undefined, index: number) => {
    const k = keyFor(serviceTypeId);
    const arr = storeRef.current.get(k) ?? [];
    if (index >= 0 && index < arr.length) {
      arr.splice(index, 1);
      if (arr.length === 0) storeRef.current.delete(k); else storeRef.current.set(k, arr);
      setTick((v) => v + 1);
    }
  };

  const value: AttachmentsDraftContextValue = {
    getDraft,
    setDraft,
    clearDraft,
    addAttachment,
    removeAttachment,
  };

  return <AttachmentsDraftContext.Provider value={value}>{children}</AttachmentsDraftContext.Provider>;
}

export function useAttachmentsDrafts() {
  const ctx = useContext(AttachmentsDraftContext);
  if (!ctx) throw new Error('useAttachmentsDrafts must be used within AttachmentsDraftProvider');
  return ctx;
}

// Safe optional accessor that returns null when provider is absent
export function useOptionalAttachmentsDrafts() {
  return useContext(AttachmentsDraftContext);
}
