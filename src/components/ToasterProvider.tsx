"use client";

import { Toaster } from "sonner";

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
      duration={2500}
    />
  );
}
