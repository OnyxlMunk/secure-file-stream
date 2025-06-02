
import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Users, FileText, Activity, Settings, Bot, BarChart3 } from 'lucide-react';
import UserManagement from './UserManagement';
import FileManagement from './FileManagement';
import ActivityLogs from './ActivityLogs';
import AdminSettings from './AdminSettings';
import AdminChatbot from './AdminChatbot';
import ApiManager from './ApiManager';
import AdminStats from './AdminStats';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('stats');

  const menuItems = [
    { id: 'stats', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'files', label: 'File Management', icon: FileText },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'chatbot', label: 'AI Assistant', icon: Bot },
    { id: 'api', label: 'API Manager', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'stats':
        return <AdminStats />;
      case 'users':
        return <UserManagement />;
      case 'files':
        return <FileManagement />;
      case 'activity':
        return <ActivityLogs />;
      case 'chatbot':
        return <AdminChatbot />;
      case 'api':
        return <ApiManager />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4 border-b">
            <h2 className="text-lg font-semibold">Administrator</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 p-6">
          <div className="mb-4 flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
