
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
import Search from "./pages/Search";
import Authentication from "./pages/Authentication";
import TalentsAroundMe from "./pages/TalentsAroundMe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/work" element={<Work />} />
          <Route path="/talents-around-me" element={<TalentsAroundMe />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
