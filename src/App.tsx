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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SocialSidebar from "./components/SocialSidebar";
import RightSidebar from "./components/RightSidebar";
import Navbar from "./components/Navbar";
import React from "react";
import { Sheet, SheetTrigger, SheetContent } from "./components/ui/sheet";
import { Menu } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <div>
              <div className="md:hidden fixed top-3 left-3 z-50">
                <SidebarTrigger />
              </div>
              <div className="hidden md:block animate-fade-in animate-scale-in">
                <SocialSidebar />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-screen">
              <Navbar />

              <div className="flex md:hidden fixed top-3 right-3 z-50">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="p-2 bg-white/80 rounded-full border border-gray-200 shadow-lg hover:scale-105 transition"
                      aria-label="Open menu"
                    >
                      <Menu className="h-6 w-6 text-gray-700" />
                    </button>
                  </SheetTrigger>
                  <SheetContent className="bg-white animate-fade-in animate-scale-in px-0 py-6 shadow-xl w-72">
                    <RightSidebar />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex-1 pt-14 flex">
                <main className="flex-1 mx-auto w-full max-w-screen-xl px-4 py-6 animate-fade-in">
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <div className="hidden lg:block animate-fade-in animate-scale-in">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
