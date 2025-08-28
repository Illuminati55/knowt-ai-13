import { useState } from "react";
import { LayoutGrid, List, Filter, SortAsc, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useContent, ContentItem } from "@/hooks/useContent";
import ContentCard from "./ContentCard";
import CreateCollectionModal from "./CreateCollectionModal";
import AddToCollectionModal from "./AddToCollectionModal";

interface DashboardProps {
  activeTab?: string;
}

const Dashboard = ({ activeTab = "dashboard" }: DashboardProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [addToCollectionContent, setAddToCollectionContent] = useState<string | null>(null);
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

  // Filter items based on activeTab and selected filters
  const getFilteredItems = () => {
    let items = [...content];

    // Apply tab-based filtering
    switch (activeTab) {
      case "recent":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        items = items.filter(item => new Date(item.created_at) > weekAgo);
        break;
      case "favorites":
        items = items.filter(item => item.is_favorite);
        break;
      case "web":
        items = items.filter(item => item.source === "web");
        break;
      case "documents":
        items = items.filter(item => item.source === "document");
        break;
      case "youtube":
        items = items.filter(item => item.source === "youtube");
        break;
      case "linkedin":
        items = items.filter(item => item.source === "linkedin");
        break;
    }

    // Apply additional filters
    if (selectedFilter === "completed") {
      items = items.filter(item => item.processing_status === "completed");
    } else if (selectedFilter === "processing") {
      items = items.filter(item => item.processing_status === "processing");
    } else if (selectedFilter === "recent") {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - 7);
      items = items.filter(item => new Date(item.created_at) > createdDate);
    }

    // Apply sorting
    items.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "processing_status":
          aValue = a.processing_status;
          bValue = b.processing_status;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return items;
  };

  const filteredItems = getFilteredItems();

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                  All Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("completed")}>
                  AI Processed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("processing")}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedFilter("recent")}>
                  Recent (7 days)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("created_at")}>
                  Date Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("title")}>
                  Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("processing_status")}>
                  Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
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
              thumbnail={item.thumbnail_url}
              viewMode={viewMode}
              onAddToCollection={() => setAddToCollectionContent(item.id)}
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

      {/* Create Collection Modal */}
      <CreateCollectionModal 
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
      />

      {/* Add to Collection Modal */}
      <AddToCollectionModal 
        isOpen={!!addToCollectionContent}
        onClose={() => setAddToCollectionContent(null)}
        contentId={addToCollectionContent || ''}
      />

    </main>
  );
};

export default Dashboard;