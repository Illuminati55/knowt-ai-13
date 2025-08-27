import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar"; 
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
