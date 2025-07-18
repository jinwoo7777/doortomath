"use client";

import { useWow } from "@/lib/hooks/useWow.js";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { setupGlobalErrorHandler } from "@/lib/auth/refreshTokenErrorHandler";

export const ProviderComponent = ({ children }) => {
  useWow();

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
    require("../../assets/js/jquery-ui.min.js");
    
    // 전역 리프레시 토큰 오류 처리기 설정
    setupGlobalErrorHandler();
  }, []);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
};
