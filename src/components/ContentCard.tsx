import { useState } from "react";
import { Heart, ExternalLink, Edit3, Trash2, Plus, Youtube, Linkedin, Globe, FileText, BookOpen, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/hooks/useContent";
import { toast } from "@/hooks/use-toast";

export interface ContentCardProps {
  id: string;
  title: string;
  summary?: string;
  url: string;
  source: "web" | "youtube" | "linkedin" | "document" | "medium" | "substack";
  tags?: string[];
  createdAt: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  thumbnail?: string;
  keyTakeaways?: string[];
  is_favorite: boolean;
  viewMode: "grid" | "list";
  onAddToCollection: () => void;
  onAIInsights?: () => void;
}

const ContentCard = ({
  id,
  title,
  summary,
  url,
  source,
  tags,
  createdAt,
  processingStatus,
  thumbnail,
  keyTakeaways,
  is_favorite,
  viewMode,
  onAddToCollection,
  onAIInsights,
}: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, deleteContent } = useContent();

  const getSourceIcon = () => {
    switch (source) {
      case "youtube": return Youtube;
      case "linkedin": return Linkedin;
      case "document": return FileText;
      case "medium": return BookOpen;
      case "substack": return Rss;
      default: return Globe;
    }
  };

  const getSourceColor = () => {
    switch (source) {
      case "youtube": return "text-red-500";
      case "linkedin": return "text-blue-600";
      case "document": return "text-gray-600";
      case "medium": return "text-green-600";
      case "substack": return "text-orange-500";
      default: return "text-blue-500";
    }
  };

  const getActionText = () => {
    switch (source) {
      case "youtube": return "Watch Now";
      case "document": return "Read Document";
      default: return "Read More";
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteContent(id);
      toast({
        title: "Content deleted",
        description: "The content has been removed from your collection.",
      });
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCollection();
  };

  const handleTitleClick = () => {
    window.open(url, '_blank');
  };

  const handleAIInsights = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAIInsights) {
      onAIInsights();
    }
  };

  const SourceIcon = getSourceIcon();

  if (viewMode === "list") {
    return (
      <div 
        className="group flex items-center space-x-4 p-4 bg-card border border-card-border rounded-lg hover:shadow-md transition-smooth"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted overflow-hidden">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${thumbnail ? 'hidden' : ''}`}>
            <SourceIcon className={`h-6 w-6 ${getSourceColor()}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <h3 
                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                onClick={handleTitleClick}
              >
                {title}
              </h3>
              {summary && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {summary}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <SourceIcon className="h-3 w-3 mr-1" />
                  {source}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                  className="text-xs h-6"
                >
                  {getActionText()}
                </Button>
              </div>
            </div>

            {/* Actions - visible on hover */}
            <div className={`flex items-center space-x-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${is_favorite ? 'text-red-500 fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddToCollection}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {processingStatus === "completed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAIInsights}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="group bg-card border border-card-border rounded-lg overflow-hidden hover:shadow-lg transition-smooth cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favorite Star - Top Right on Hover */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavorite}
        className={`absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <Heart className={`h-4 w-4 ${is_favorite ? 'text-red-500 fill-current' : ''}`} />
      </Button>

      {/* Header with Thumbnail */}
      <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${thumbnail ? 'hidden' : ''}`}>
          <SourceIcon className={`h-8 w-8 ${getSourceColor()}`} />
        </div>
        
        {/* Source Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs bg-white/80 backdrop-blur-sm">
            <SourceIcon className="h-3 w-3 mr-1" />
            {source}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 
          className="font-semibold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
          onClick={handleTitleClick}
        >
          {title}
        </h3>
        
        {summary && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {summary}
          </p>
        )}

        {/* AI Insights */}
        {processingStatus === "completed" && keyTakeaways && keyTakeaways.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Key Insights</p>
            <div className="space-y-1">
              {keyTakeaways.slice(0, 2).map((takeaway, index) => (
                <p key={index} className="text-xs text-muted-foreground line-clamp-1">
                  • {takeaway}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="text-xs"
          >
            {getActionText()}
          </Button>
          
          <div className="flex items-center space-x-1">
            {processingStatus === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAIInsights}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                title="Generate AI Insights"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToCollection}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;