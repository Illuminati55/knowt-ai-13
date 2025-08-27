import { useState } from "react";
import { 
  Home, 
  BookOpen, 
  Tags, 
  Folder, 
  Star, 
  Clock, 
  Zap,
  Plus,
  ChevronRight,
  Globe,
  FileText,
  Youtube,
  Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddContentModal from "./AddContentModal";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedSections, setExpandedSections] = useState(["collections"]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, count: null },
    { id: "recent", label: "Recent", icon: Clock, count: null },
    { id: "favorites", label: "Favorites", icon: Star, count: 24 },
    { id: "all-items", label: "All Items", icon: BookOpen, count: 156 },
  ];

  const collections = [
    { id: "ai-research", name: "AI Research", color: "bg-blue-500", count: 23 },
    { id: "design-inspiration", name: "Design Inspiration", color: "bg-purple-500", count: 18 },
    { id: "productivity", name: "Productivity", color: "bg-green-500", count: 31 },
    { id: "learning", name: "Learning Resources", color: "bg-orange-500", count: 42 },
  ];

  const sources = [
    { id: "web", name: "Web Articles", icon: Globe, count: 89 },
    { id: "documents", name: "Documents", icon: FileText, count: 34 },
    { id: "youtube", name: "YouTube", icon: Youtube, count: 23 },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, count: 10 },
  ];

  return (
    <>
      <aside className="w-72 h-screen border-r border-card-border bg-card/50 backdrop-blur-sm overflow-y-auto">
        <div className="p-6 space-y-6">
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <Button 
              className="w-full gradient-primary hover:shadow-ai transition-smooth"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Content
            </Button>
            <Button variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Collections */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto font-semibold text-sm"
              onClick={() => toggleSection("collections")}
            >
              <ChevronRight 
                className={`h-4 w-4 mr-2 transition-transform ${
                  expandedSections.includes("collections") ? "rotate-90" : ""
                }`}
              />
              Collections
            </Button>
            
            {expandedSections.includes("collections") && (
              <div className="space-y-1 pl-6">
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-smooth">
                    <div className={`h-3 w-3 rounded-full ${collection.color}`} />
                    <span className="text-sm flex-1">{collection.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {collection.count}
                    </Badge>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground mt-2">
                  <Plus className="h-3 w-3 mr-2" />
                  New Collection
                </Button>
              </div>
            )}
          </div>

          {/* Sources */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start p-0 h-auto font-semibold text-sm"
              onClick={() => toggleSection("sources")}
            >
              <ChevronRight 
                className={`h-4 w-4 mr-2 transition-transform ${
                  expandedSections.includes("sources") ? "rotate-90" : ""
                }`}
              />
              Sources
            </Button>
            
            {expandedSections.includes("sources") && (
              <div className="space-y-1 pl-6">
                {sources.map((source) => (
                  <div key={source.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-smooth">
                    <source.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{source.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {source.count}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Processing Status */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-processing animate-pulse" />
              <span className="text-sm font-medium">AI Processing</span>
            </div>
            <p className="text-xs text-muted-foreground">
              3 items being analyzed for insights and tags
            </p>
          </div>

        </div>
      </aside>
      
      <AddContentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
};

export default Sidebar;