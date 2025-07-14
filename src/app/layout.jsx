import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/fontawesome.min.css";
import "../assets/css/animate.css";
import "../assets/css/jquery-ui.min.css";
import "../assets/css/style.css";
import "../styles/globals.css";

import { ProviderComponent } from "@/components/provider/Provider";

export const metadata = {
  title: "대치 수학의문| 온라인 교육 플랫폼",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="td_theme_2" suppressHydrationWarning={true}>
      <body>
        <ProviderComponent>{children}</ProviderComponent>
      </body>
    </html>
  );
}
