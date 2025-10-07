"use client";

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// Import your new store factory
import { makeStore, AppStore, AppPersistor } from "@/store/store";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Use useRef to ensure the store and persistor are only created once
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<AppPersistor | null>(null);

  if (!storeRef.current) {
    const { store, persistor } = makeStore();
    storeRef.current = store;
    persistorRef.current = persistor;
  }

  return (
    <Provider store={storeRef.current}>
      {/* PersistGate handles the rehydration process */}
      <PersistGate loading={null} persistor={persistorRef.current!}>
        {children}
      </PersistGate>
    </Provider>
  );
}
