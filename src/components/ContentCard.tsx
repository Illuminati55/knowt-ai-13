import { Clock, ExternalLink, FileText, Globe, Youtube, Linkedin, Zap, Tag, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useContent";

interface ContentCardProps {
  id: string;
  title: string;
  summary: string;
  url?: string;
  source: "web" | "document" | "youtube" | "linkedin";
  tags: string[];
  createdAt: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  thumbnail?: string;
  keyTakeaways?: string[];
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
  is_favorite
}: ContentCardProps) => {
  const { toggleFavorite, deleteContent } = useContent();
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "web": return Globe;
      case "document": return FileText;
      case "youtube": return Youtube;
      case "linkedin": return Linkedin;
      default: return Globe;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-completed";
      case "processing": return "bg-processing";
      case "pending": return "bg-pending";
      case "failed": return "bg-failed";
      default: return "bg-muted";
    }
  };

  const SourceIcon = getSourceIcon(source);

  return (
    <Card className="group relative p-0 border-card-border bg-gradient-card hover:shadow-medium hover:-translate-y-1 transition-smooth cursor-pointer overflow-hidden">
      {/* Header with Thumbnail/Status */}
      <div className="relative h-32 bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
            <SourceIcon className="h-8 w-8" />
            <span className="text-xs capitalize">{source}</span>
          </div>
        )}
        
        {/* Processing Status Indicator */}
        <div className={`absolute top-3 right-3 h-3 w-3 rounded-full ${getStatusColor(processingStatus)}`}>
          {processingStatus === "processing" && (
            <div className="absolute inset-0 rounded-full bg-current animate-ping" />
          )}
        </div>

        {/* Source Badge */}
        <Badge 
          variant="secondary" 
          className="absolute bottom-3 left-3 text-xs bg-card/80 backdrop-blur-sm"
        >
          <SourceIcon className="h-3 w-3 mr-1" />
          {source === "web" ? "Article" : source}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-smooth">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {summary}
        </p>

        {/* Key Takeaways (if available) */}
        {keyTakeaways && keyTakeaways.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">AI Insights</span>
            </div>
            <ul className="space-y-1">
              {keyTakeaways.slice(0, 2).map((takeaway, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start space-x-1">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="line-clamp-2">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-2 py-0 h-5">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0 h-5 text-muted-foreground">
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-card-border/50">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{createdAt}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-smooth ${is_favorite ? 'text-yellow-500 opacity-100' : ''}`}
              onClick={() => toggleFavorite(id)}
            >
              <Star className={`h-3 w-3 ${is_favorite ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-smooth text-red-500"
              onClick={() => deleteContent(id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            {url && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-smooth">
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContentCard;