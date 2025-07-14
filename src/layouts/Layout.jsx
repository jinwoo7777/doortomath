"use client";

import React, { useLayoutEffect } from "react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { FooterThree } from "@/components/footers/FooterThree";
import { HeaderThree } from "@/components/headers/HeaderThree";
import { ScrollToTop } from "@/components/scroll_to_top/ScrollToTop";
import { usePathname } from "next/navigation";

export const Layout = ({
  children,
  // Only HeaderThree and FooterThree are used in the application
  // The header and footer props are kept for future compatibility
  bodyClass,
  breadcrumbTitle,
  breadcrumbSubtitle,
}) => {
  const pathname = usePathname();

  // theme
  useLayoutEffect(() => {
    document.body.classList.add(bodyClass);

    return () => document.body.classList.remove(bodyClass);
  }, [bodyClass, pathname]);

  return (
    <>
      {/* scroll to top */}
      <ScrollToTop />

      {/* header */}
      <HeaderThree />

      {/* breadcrumb */}
      {breadcrumbTitle && (
        <Breadcrumb title={breadcrumbTitle} subtitle={breadcrumbSubtitle} />
      )}

      {children}

      {/* footer */}
      <FooterThree />
    </>
  );
};
