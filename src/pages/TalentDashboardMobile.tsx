
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import TalentHubSidebar from '@/components/talent-dashboard/TalentHubSidebar';
import AnalyticsDashboard from '@/components/talent-dashboard/AnalyticsDashboard';
import StatusToggle from '@/components/talent-dashboard/StatusToggle';

const TalentDashboardMobile: React.FC = () => {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [workStatus, setWorkStatus] = useState('Actively Looking');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-purple-100"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Talent Dashboard
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 md:pt-6 px-4">
        <StatusToggle
          isOpenToWork={isOpenToWork}
          workStatus={workStatus}
          onToggle={setIsOpenToWork}
          onStatusChange={setWorkStatus}
        />
        
        <AnalyticsDashboard />
        
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome to Your Talent Universe! 🌟
          </h2>
          <p className="text-gray-600 mb-6">
            Manage your talent profile, track your value, and connect with opportunities.
          </p>
          <Button
            onClick={() => setSidebarOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Open Talent Hub
          </Button>
        </div>
      </div>

      {/* Talent Hub Sidebar */}
      <TalentHubSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
};

export default TalentDashboardMobile;
