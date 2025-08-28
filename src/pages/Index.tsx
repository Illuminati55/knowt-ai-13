import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar"; 
import Dashboard from "@/components/Dashboard";
import CreateCollectionModal from "@/components/CreateCollectionModal";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCreateCollection={() => setIsCreateCollectionOpen(true)}
        />
        <Dashboard activeTab={activeTab} />
      </div>
      
      <CreateCollectionModal 
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
      />
    </div>
  );
};

export default Index;
