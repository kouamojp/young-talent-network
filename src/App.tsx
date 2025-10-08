import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import Messages from "./pages/Messages";
import Categories from "./pages/Categories";
import Participants from "./pages/Participants";
import Communities from "./pages/Communities";
import Organizations from "./pages/Organizations";
import AptitudeTest from "./pages/AptitudeTest";
import Events from "./pages/Events";
import OnlineTV from "./pages/OnlineTV";
import Work from "./pages/Work";
import Learning from "./pages/Learning";
import Live from "./pages/Live";
import Search from "./pages/Search";
import Authentication from "./pages/Authentication";
import TalentsAroundMe from "./pages/TalentsAroundMe";
import YatCoin from "./pages/YatCoin";
import TalentDashboard from "./pages/TalentDashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import SocialSidebar from "./components/SocialSidebar";
import RightSidebar from "./components/RightSidebar";
import Navbar from "./components/Navbar";
const queryClient = new QueryClient();
const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  return <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Fixed Navbar */}
        <Navbar />
        
        {/* Main Layout Container */}
        <div className="flex w-full pt-14">
          {/* Left Sidebar - Fixed */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="fixed top-14 left-0 w-[280px] h-[calc(100vh-3.5rem)] overflow-y-auto">
              <SidebarProvider>
                <SocialSidebar />
              </SidebarProvider>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <main className="flex-1 min-w-0 bg-background mx-0">
            <div className="max-w-[680px] mx-auto py-0 px-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Authentication />} />
                <Route path="/search" element={<Search />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/news" element={<News />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/test" element={<AptitudeTest />} />
                <Route path="/events" element={<Events />} />
                <Route path="/tv" element={<OnlineTV />} />
                <Route path="/live" element={<Live />} />
                <Route path="/work" element={<Work />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/talents-around-me" element={<TalentsAroundMe />} />
                <Route path="/yat-coin" element={<YatCoin />} />
                <Route path="/talent-dashboard" element={<TalentDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>

          {/* Right Sidebar - Fixed */}
          <div className="hidden xl:block w-[320px] flex-shrink-0">
            <div className="fixed top-14 right-0 w-[320px] h-[calc(100vh-3.5rem)] overflow-y-auto">
              <RightSidebar />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>;
};
export default App;