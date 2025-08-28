import { useState } from "react";
import { Heart, ExternalLink, Edit3, Trash2, Plus, Youtube, Linkedin, Globe, FileText, BookOpen, Rss, Sparkles } from "lucide-react";
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
  viewMode: "grid" | "list" | "tiles";
  cardSettings?: {
    showSummary: boolean;
    showTags: boolean;
    showKeyTakeaways: boolean;
    showSource: boolean;
  };
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
  cardSettings = {
    showSummary: true,
    showTags: true,
    showKeyTakeaways: true,
    showSource: true,
  },
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

  // Tiles view - minimal view with just image and title
  if (viewMode === "tiles") {
    return (
      <div 
        className="group bg-card border rounded-lg overflow-hidden hover:shadow-clean transition-smooth cursor-pointer aspect-square relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleTitleClick}
      >
        {/* Favorite Star - Top Right on Hover */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavorite}
          className={`absolute top-1 right-1 z-10 h-5 lg:h-6 w-5 lg:w-6 p-0 bg-black/20 backdrop-blur-sm transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Heart className={`h-2 lg:h-3 w-2 lg:w-3 ${is_favorite ? 'text-red-500 fill-current' : 'text-white'}`} />
        </Button>

        {/* Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50">
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
            <SourceIcon className={`h-4 lg:h-6 w-4 lg:w-6 ${getSourceColor()}`} />
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1 lg:p-2">
          <h3 className="text-white text-xs font-medium line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>

        {/* Source Badge */}
        <div className="absolute top-1 left-1">
          <Badge variant="secondary" className="text-xs bg-black/20 text-white backdrop-blur-sm border-0 h-4 lg:h-5">
            <SourceIcon className="h-2 w-2 mr-1" />
            <span className="hidden lg:inline">{source}</span>
          </Badge>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div 
        className="group flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-card border rounded-lg hover:shadow-clean transition-smooth"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg bg-muted overflow-hidden">
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
            <SourceIcon className={`h-4 lg:h-6 w-4 lg:w-6 ${getSourceColor()}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-2 lg:mr-4">
              <h3 
                className="font-medium lg:font-semibold text-foreground text-sm lg:text-base truncate cursor-pointer hover:text-primary transition-colors"
                onClick={handleTitleClick}
              >
                {title}
              </h3>
              {summary && (
                <p className="text-xs lg:text-sm text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
                  {summary}
                </p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <SourceIcon className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{source}</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                  className="text-xs h-5 lg:h-6 px-2"
                >
                  {getActionText()}
                </Button>
              </div>
            </div>

            {/* Actions - visible on hover for desktop, always visible on mobile */}
            <div className={`flex items-center space-x-1 transition-opacity ${isHovered || window.innerWidth < 768 ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="h-6 lg:h-8 w-6 lg:w-8 p-0"
              >
                <Heart className={`h-3 lg:h-4 w-3 lg:w-4 ${is_favorite ? 'text-red-500 fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddToCollection}
                className="h-6 lg:h-8 w-6 lg:w-8 p-0"
              >
                <Plus className="h-3 lg:h-4 w-3 lg:w-4" />
              </Button>
              {processingStatus === "completed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAIInsights}
                  className="h-6 lg:h-8 w-6 lg:w-8 p-0"
                >
                  <Edit3 className="h-3 lg:h-4 w-3 lg:w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 lg:h-8 w-6 lg:w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 lg:h-4 w-3 lg:w-4" />
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
      className="group bg-card border rounded-lg overflow-hidden hover:shadow-clean transition-smooth cursor-pointer relative flex flex-col h-full"
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
        {cardSettings.showSource && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-white/80 backdrop-blur-sm">
              <SourceIcon className="h-3 w-3 mr-1" />
              {source}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 lg:p-4 flex flex-col flex-1">
        <h3 
          className="font-medium lg:font-semibold text-foreground text-sm lg:text-base mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
          onClick={handleTitleClick}
        >
          {title}
        </h3>
        
        {cardSettings.showSummary && summary && (
          <p className="text-xs lg:text-sm text-muted-foreground mb-3 line-clamp-2 lg:line-clamp-3">
            {summary}
          </p>
        )}

        {/* AI Insights */}
        {cardSettings.showKeyTakeaways && processingStatus === "completed" && keyTakeaways && keyTakeaways.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Key Insights</p>
            <div className="space-y-1">
              {keyTakeaways.slice(0, 1).map((takeaway, index) => (
                <p key={index} className="text-xs text-muted-foreground line-clamp-1">
                  • {takeaway}
                </p>
              ))}
              <div className="lg:block hidden">
                {keyTakeaways.slice(1, 2).map((takeaway, index) => (
                  <p key={index + 1} className="text-xs text-muted-foreground line-clamp-1">
                    • {takeaway}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {cardSettings.showTags && tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            <div className="hidden lg:flex lg:flex-wrap lg:gap-1">
              {tags.slice(2, 3).map((tag) => (
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
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs lg:hidden">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Processing Status */}
        {processingStatus === "processing" && (
          <div className="mb-3 flex items-center text-xs text-muted-foreground">
            <div className="h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin mr-2" />
            <span>AI processing...</span>
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Footer Actions - Always at bottom */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="text-xs px-2 lg:px-3 h-6 lg:h-8"
          >
            {getActionText()}
          </Button>
          
          <div className="flex items-center space-x-1">
            {processingStatus === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAIInsights}
                className="h-6 lg:h-8 w-6 lg:w-8 p-0 text-muted-foreground hover:text-primary"
                title="AI Insights"
              >
                <Sparkles className="h-3 lg:h-4 w-3 lg:w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToCollection}
              className="h-6 lg:h-8 w-6 lg:w-8 p-0 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-3 lg:h-4 w-3 lg:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-6 lg:h-8 w-6 lg:w-8 p-0 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-3 lg:h-4 w-3 lg:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;