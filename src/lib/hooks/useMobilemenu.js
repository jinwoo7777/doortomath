import $ from "jquery";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const useMobilemenu = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        $(".td_nav").append(
          '<span class="td_menu_toggle"><span></span></span>'
        );
        $(".menu-item-has-children").append(
          '<span class="td_munu_dropdown_toggle"><span></span></span>'
        );
        $(".td_menu_toggle").on("click", function () {
          $(this)
            .toggleClass("td_toggle_active")
            .siblings(".td_nav_list_wrap")
            .toggleClass("td_active");
        });
        $(".td_munu_dropdown_toggle").on("click", function () {
          $(this).toggleClass("active").siblings("ul").slideToggle();
          $(this).parent().toggleClass("active");
        });

        $(".td_header_dropdown_btn").on("click", function () {
          $(this).toggleClass("active");
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [pathname]);
};
