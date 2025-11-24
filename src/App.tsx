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
import RightSidebar from "./components/RightSidebar";
import Navbar from "./components/Navbar";
const queryClient = new QueryClient();
const App = () => {
  return <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Fixed Navbar */}
        <Navbar />
        
        {/* Main Layout Container - Centered */}
        <div className="flex justify-center w-full pt-14">
          {/* Main Content - Centered and Scrollable */}
          <main className="w-full max-w-[1400px] bg-background px-4">
            <div className="flex gap-4">
              {/* Main Feed - Centered */}
              <div className="flex-1 max-w-[900px] mx-auto py-0">
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
                  <Route path="/organization-profiles" element={<OrganizationProfiles />} />
                  <Route path="/test" element={<AptitudeTest />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/tv" element={<OnlineTV />} />
                  <Route path="/live" element={<Live />} />
                  <Route path="/work" element={<Work />} />
                  <Route path="/learning" element={<Learning />} />
                  <Route path="/talents-around-me" element={<TalentsAroundMe />} />
                  <Route path="/yat-coin" element={<YatCoin />} />
                  <Route path="/karta" element={<YatKarta />} />
                  <Route path="/talent-dashboard" element={<TalentDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>

              {/* Right Sidebar - Fixed on large screens */}
              <div className="hidden xl:block w-[280px] flex-shrink-0">
                <div className="sticky top-16">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>;
};
export default App;