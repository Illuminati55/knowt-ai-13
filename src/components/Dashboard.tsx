import { useState } from "react";
import { LayoutGrid, List, Filter, SortAsc, Plus, Grid3X3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useContent, ContentItem } from "@/hooks/useContent";
import ContentCard from "./ContentCard";
import CreateCollectionModal from "./CreateCollectionModal";
import AddToCollectionModal from "./AddToCollectionModal";
import AIInsightsModal from "./AIInsightsModal";

interface DashboardProps {
  activeTab?: string;
}

const Dashboard = ({ activeTab = "dashboard" }: DashboardProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "tiles">("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [addToCollectionContent, setAddToCollectionContent] = useState<string | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    showSummary: true,
    showTags: true,
    showKeyTakeaways: true,
    showSource: true,
  });
  const { content, loading } = useContent();

  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");

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

  const sourceFilters = [
    { id: "all", label: "All Sources" },
    { id: "web", label: "Web Articles" },
    { id: "youtube", label: "YouTube" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "medium", label: "Medium" },
    { id: "substack", label: "Substack" },
    { id: "document", label: "Documents" },
  ];

  const allTags = Array.from(new Set(content.flatMap(item => item.tags || [])));

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
      case "medium":
        items = items.filter(item => item.source === "medium");
        break;
      case "substack":
        items = items.filter(item => item.source === "substack");
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

    // Apply source filter
    if (selectedSource !== "all") {
      items = items.filter(item => item.source === selectedSource);
    }

    // Apply tag filter
    if (selectedTag) {
      items = items.filter(item => item.tags?.includes(selectedTag));
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
    <main className="flex-1 p-4 lg:p-6 space-y-6 max-h-screen overflow-y-auto">
      
      {/* Header Section */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-foreground">
              Curator AI
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1">
              {content.length} items curated and organized by AI
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 lg:gap-2">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 lg:h-8 w-7 lg:w-8 p-0"
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid className="h-3 lg:h-4 w-3 lg:w-4" />
              </Button>
              <Button
                variant={viewMode === "tiles" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 lg:h-8 w-7 lg:w-8 p-0"
                onClick={() => setViewMode("tiles")}
                title="Tile View"
              >
                <Grid3X3 className="h-3 lg:h-4 w-3 lg:w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 lg:h-8 w-7 lg:w-8 p-0"
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List className="h-3 lg:h-4 w-3 lg:w-4" />
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                  <Filter className="h-3 lg:h-4 w-3 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Source</h4>
                  {sourceFilters.map(source => (
                    <DropdownMenuItem 
                      key={source.id} 
                      onClick={() => setSelectedSource(source.id)}
                      className={selectedSource === source.id ? "bg-accent" : ""}
                    >
                      {source.label}
                    </DropdownMenuItem>
                  ))}
                </div>
                
                {allTags.length > 0 && (
                  <div className="border-t p-2">
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="max-h-32 overflow-y-auto">
                      <DropdownMenuItem 
                        onClick={() => setSelectedTag("")}
                        className={!selectedTag ? "bg-accent" : ""}
                      >
                        All Tags
                      </DropdownMenuItem>
                      {allTags.slice(0, 10).map(tag => (
                        <DropdownMenuItem 
                          key={tag} 
                          onClick={() => setSelectedTag(tag)}
                          className={selectedTag === tag ? "bg-accent" : ""}
                        >
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                  <SortAsc className="h-3 lg:h-4 w-3 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("created_at")}>
                  Date Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("title")}>
                  Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("processing_status")}>
                  Status
                </DropdownMenuItem>
                <div className="border-t mt-1 pt-1">
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {viewMode === "grid" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCardSettings(!showCardSettings)}
                className="hidden lg:inline-flex"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="transition-smooth"
            >
              {filter.label}
              <Badge 
                variant="secondary"
                className="ml-2 text-xs"
              >
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Card Customization Panel */}
        {showCardSettings && viewMode === "grid" && (
          <div className="p-4 bg-card border rounded-lg">
            <h3 className="font-medium mb-3">Card Display Options</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardSettings.showSummary}
                  onChange={(e) => setCardSettings(prev => ({ ...prev, showSummary: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Summary</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardSettings.showTags}
                  onChange={(e) => setCardSettings(prev => ({ ...prev, showTags: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Tags</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardSettings.showKeyTakeaways}
                  onChange={(e) => setCardSettings(prev => ({ ...prev, showKeyTakeaways: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Key Insights</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardSettings.showSource}
                  onChange={(e) => setCardSettings(prev => ({ ...prev, showSource: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Source Badge</span>
              </label>
            </div>
          </div>
        )}
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
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4" 
            : viewMode === "tiles"
            ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 lg:gap-3"
            : "space-y-2 lg:space-y-3"
          }
        `}>
          {filteredItems.map((item) => (
            <ContentCard 
              key={item.id} 
              {...item}
              source={item.source as "web" | "youtube" | "linkedin" | "document" | "medium" | "substack"}
              createdAt={new Date(item.created_at).toLocaleDateString()}
              processingStatus={item.processing_status}
              keyTakeaways={item.key_takeaways}
              thumbnail={item.thumbnail_url}
              viewMode={viewMode}
              cardSettings={cardSettings}
              onAddToCollection={() => setAddToCollectionContent(item.id)}
              onAIInsights={() => setIsAIInsightsOpen(true)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && !loading && (
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

      {/* AI Insights Modal */}
      <AIInsightsModal 
        isOpen={isAIInsightsOpen}
        onClose={() => setIsAIInsightsOpen(false)}
      />

    </main>
  );
};

export default Dashboard;