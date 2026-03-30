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
import OrganizationProfiles from "./pages/OrganizationProfiles";
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
import YatKarta from "./pages/YatKarta";
import TalentDashboard from "./pages/TalentDashboard";
import TalentPublicProfile from "./pages/TalentPublicProfile";
import AgentProfile from "./pages/AgentProfile";
import OrganizationHub from "./pages/OrganizationHub";
import Media from "./pages/Media";
import Marketplace from "./pages/Marketplace";
import Social from "./pages/Social";
import Feed from "./pages/Feed";
import Calls from "./pages/Calls";
import SettingsPage from "./pages/Settings";

import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import SidebarMain from "./components/sidebar/SidebarMain";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Fixed Navbar */}
        <Navbar />
        
        {/* Main Layout Container */}
        <div className="w-full pt-14 pb-16 md:pb-0">
          <div className="max-w-[1400px] mx-auto flex">
            {/* Left Sidebar - desktop only */}
            <aside className="hidden md:block w-[260px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border bg-card">
              <SidebarMain />
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Authentication />} />
                <Route path="/search" element={<Search />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/news" element={<News />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/organization-profiles" element={<OrganizationProfiles />} />
                <Route path="/test" element={<AptitudeTest />} />
                <Route path="/events" element={<Events />} />
                <Route path="/tv" element={<OnlineTV />} />
                <Route path="/live" element={<Live />} />
                <Route path="/media" element={<Media />} />
                <Route path="/work" element={<Work />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/talents-around-me" element={<TalentsAroundMe />} />
                <Route path="/yat-coin" element={<YatCoin />} />
                <Route path="/karta" element={<YatKarta />} />
                <Route path="/talent-dashboard" element={<TalentDashboard />} />
                <Route path="/talent/:id" element={<TalentPublicProfile />} />
                <Route path="/agent/:id" element={<AgentProfile />} />
                <Route path="/organization/:id" element={<OrganizationHub />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/social" element={<Social />} />
                <Route path="/yat-database" element={<YatDatabase />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
