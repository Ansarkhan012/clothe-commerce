"use client";

import { ReactNode, useEffect } from "react";
import { useCartStore } from "@/src/store/useCartStore";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
