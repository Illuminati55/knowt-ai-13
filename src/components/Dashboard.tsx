import { useState } from "react";
import { LayoutGrid, List, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContent, ContentItem } from "@/hooks/useContent";
import ContentCard from "./ContentCard";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { content, loading } = useContent();

  const filters = [
    { id: "all", label: "All Items", count: content.length },
    { id: "completed", label: "AI Processed", count: content.filter(item => item.processing_status === "completed").length },
    { id: "processing", label: "Processing", count: content.filter(item => item.processing_status === "processing").length },
    { id: "recent", label: "Recent", count: content.filter(item => {
      const createdDate = new Date(item.created_at);
      const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length },
  ];

  const filteredItems = content.filter(item => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "completed") return item.processing_status === "completed";
    if (selectedFilter === "processing") return item.processing_status === "processing";
    if (selectedFilter === "recent") {
      const createdDate = new Date(item.created_at);
      const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }
    return true;
  });

  return (
    <main className="flex-1 p-6 space-y-6 max-h-screen overflow-y-auto">
      
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Knowledge Base
            </h1>
            <p className="text-muted-foreground mt-1">
              {content.length} items curated and organized by AI
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="transition-smooth"
            >
              {filter.label}
              <Badge 
                variant={selectedFilter === filter.id ? "default" : "secondary"}
                className="ml-2 text-xs"
              >
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your content...</p>
          </div>
        </div>
      ) : (
        <div className={`
          ${viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "space-y-3"
          }
        `}>
          {filteredItems.map((item) => (
            <ContentCard 
              key={item.id} 
              {...item}
              source={item.source as "web" | "youtube" | "linkedin" | "document"}
              createdAt={new Date(item.created_at).toLocaleDateString()}
              processingStatus={item.processing_status}
              keyTakeaways={item.key_takeaways}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or add some new content to get started.
          </p>
        </div>
      )}

    </main>
  );
};

export default Dashboard;