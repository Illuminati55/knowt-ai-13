import { useState } from "react";
import { LayoutGrid, List, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContentCard from "./ContentCard";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data for demonstration
  const mockItems = [
    {
      id: "1",
      title: "The Future of AI in Knowledge Management Systems",
      summary: "An in-depth analysis of how artificial intelligence is revolutionizing the way we capture, organize, and retrieve information. This comprehensive guide covers machine learning algorithms, natural language processing, and the emerging trends in AI-powered productivity tools.",
      url: "https://example.com/ai-knowledge-management",
      source: "web" as const,
      tags: ["AI", "Knowledge Management", "Productivity", "Machine Learning"],
      createdAt: "2 hours ago",
      processingStatus: "completed" as const,
      keyTakeaways: [
        "AI can reduce information retrieval time by up to 70%",
        "Natural language queries are becoming the standard for search",
        "Automated tagging accuracy has improved to 95% with modern models"
      ]
    },
    {
      id: "2", 
      title: "Building Scalable React Applications with TypeScript",
      summary: "A comprehensive guide to architecting large-scale React applications using TypeScript. Covers best practices, design patterns, and performance optimization strategies for modern web development.",
      source: "youtube" as const,
      tags: ["React", "TypeScript", "Web Development", "Architecture"],
      createdAt: "5 hours ago",
      processingStatus: "processing" as const,
    },
    {
      id: "3",
      title: "Design Systems: Creating Consistent User Experiences",
      summary: "Learn how to build and maintain design systems that scale across products and teams. This document covers component libraries, design tokens, and collaboration strategies.",
      source: "document" as const,
      tags: ["Design Systems", "UI/UX", "Frontend"],
      createdAt: "1 day ago",
      processingStatus: "completed" as const,
      keyTakeaways: [
        "Design systems reduce development time by 40%",
        "Consistency improves user satisfaction scores significantly",
        "Proper documentation is key to adoption success"
      ]
    },
    {
      id: "4",
      title: "The Psychology of User Interface Design",
      summary: "Understanding cognitive psychology principles that make interfaces intuitive and user-friendly. Explore color theory, cognitive load, and user behavior patterns.",
      url: "https://linkedin.com/pulse/psychology-ui-design",
      source: "linkedin" as const,
      tags: ["Psychology", "UI Design", "User Experience"],
      createdAt: "2 days ago",
      processingStatus: "pending" as const,
    },
    {
      id: "5",
      title: "Advanced CSS Grid Techniques for Modern Layouts",
      summary: "Master CSS Grid with practical examples and advanced techniques. Learn how to create complex, responsive layouts that adapt to any screen size and device.",
      source: "web" as const,
      tags: ["CSS", "Web Design", "Frontend", "Responsive Design"],
      createdAt: "3 days ago", 
      processingStatus: "completed" as const,
      keyTakeaways: [
        "CSS Grid reduces layout code complexity by 60%",
        "Subgrid support is now available in all major browsers",
        "Combining Grid with Flexbox creates powerful layout systems"
      ]
    },
    {
      id: "6",
      title: "Machine Learning for Beginners: A Practical Introduction",
      summary: "Start your journey into machine learning with this beginner-friendly guide. Covers fundamental concepts, algorithms, and hands-on projects to build your first ML models.",
      source: "document" as const,
      tags: ["Machine Learning", "AI", "Beginners", "Data Science"],
      createdAt: "1 week ago",
      processingStatus: "failed" as const,
    }
  ];

  const filters = [
    { id: "all", label: "All Items", count: mockItems.length },
    { id: "completed", label: "AI Processed", count: mockItems.filter(item => item.processingStatus === "completed").length },
    { id: "processing", label: "Processing", count: mockItems.filter(item => item.processingStatus === "processing").length },
    { id: "recent", label: "Recent", count: mockItems.filter(item => item.createdAt.includes("hour") || item.createdAt.includes("day")).length },
  ];

  const filteredItems = mockItems.filter(item => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "completed") return item.processingStatus === "completed";
    if (selectedFilter === "processing") return item.processingStatus === "processing";
    if (selectedFilter === "recent") return item.createdAt.includes("hour") || item.createdAt.includes("day");
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
              {mockItems.length} items curated and organized by AI
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
      <div className={`
        ${viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
          : "space-y-3"
        }
      `}>
        {filteredItems.map((item) => (
          <ContentCard key={item.id} {...item} />
        ))}
      </div>

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