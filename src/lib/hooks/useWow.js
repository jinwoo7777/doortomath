import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const useWow = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const WOW = require("wow.js");
      const wow = new WOW({
        // boxClass: "wow",
        // animateClass: "animated",
        // offset: 0,
        // mobile: false,
        // live: true,
      });

      wow.init();
    }
  }, [pathname]);
};
