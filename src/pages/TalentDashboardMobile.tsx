
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-background dark:via-background dark:to-background">
      {/* Content */}
      <div className="px-4 py-4">
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
