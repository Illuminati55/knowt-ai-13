import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar"; 
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:w-64 xl:w-72
        `}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onCreateCollection={() => {}}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            isSidebarOpen={isSidebarOpen} 
          />
          <Dashboard activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default Index;