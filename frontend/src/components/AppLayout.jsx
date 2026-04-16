import Navbar from "@/components/Navbar";
import Footer from "./Footer";
export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-forge-bg text-forge-text">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
        <Footer />
    </div>
  );
}
