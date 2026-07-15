import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "The Arm System",
  description: "Rate every quarterback start.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-bg min-h-screen">
        <Navbar />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
