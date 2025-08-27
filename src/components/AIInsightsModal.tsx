import { useState } from "react";
import { X, Brain, Sparkles, Lightbulb, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { toast } from "@/hooks/use-toast";

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InsightsData {
  insights: string;
  patterns: string[];
  recommendations: string[];
  topics: string[];
}

const AIInsightsModal = ({ isOpen, onClose }: AIInsightsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const { user } = useAuth();

  const generateInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          userId: user.id
        }
      });

      if (error) throw error;
      
      setInsights(data);
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error generating insights",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (open: boolean) => {
    if (open && !insights) {
      generateInsights();
    }
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 overflow-hidden">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-card-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">AI Knowledge Insights</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Discover patterns and recommendations based on your curated content
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-medium">Analyzing your knowledge collection...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-8">
              
              {/* Main Insights */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Key Insights</h3>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-accent/20 to-primary/10 border border-accent/20">
                  <p className="text-sm leading-relaxed">{insights.insights}</p>
                </div>
              </div>

              {/* Learning Patterns */}
              {insights.patterns && insights.patterns.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    <h3 className="text-lg font-semibold">Learning Patterns</h3>
                  </div>
                  <div className="grid gap-3">
                    {insights.patterns.map((pattern, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-card-border bg-card/50">
                        <div className="h-2 w-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                        <p className="text-sm">{pattern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Recommendations</h3>
                  </div>
                  <div className="grid gap-3">
                    {insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Topics */}
              {insights.topics && insights.topics.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge className="h-5 w-5 rounded-full p-0 gradient-primary" />
                    <h3 className="text-lg font-semibold">Your Interest Areas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insights.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <div className="pt-4 border-t border-card-border">
                <Button 
                  onClick={generateInsights} 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Refresh Insights
                </Button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-medium mb-2">Generate AI Insights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze your content collection to discover patterns and get personalized recommendations
                </p>
                <Button onClick={generateInsights} className="gradient-primary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
};

export default AIInsightsModal;