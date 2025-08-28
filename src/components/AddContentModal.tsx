import { useState } from "react";
import { X, Link2, Upload, FileText, Globe, Youtube, Linkedin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContent } from "@/hooks/useContent";
import { toast } from "@/hooks/use-toast";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContentModal = ({ isOpen, onClose }: AddContentModalProps) => {
  const [activeTab, setActiveTab] = useState("url");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { addContent } = useContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsProcessing(true);
    
    try {
      await addContent(url.trim(), notes.trim() || undefined);
      
      toast({
        title: "Content added successfully!",
        description: "AI is now analyzing your content for insights and tags.",
      });
      
      // Reset form and close modal
      setUrl("");
      setNotes("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Error adding content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      // For now, we'll create a simple file URL - in a real app you'd upload to storage
      const fileUrl = `document://${file.name}`;
      await addContent(fileUrl, `Uploaded file: ${file.name}`);
      
      toast({
        title: "Document uploaded successfully!",
        description: "AI is processing your document for insights.",
      });
      
      setSelectedFile(null);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const detectSource = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("linkedin.com")) return "linkedin";
    return "web";
  };

  const getSourceIcon = (url: string) => {
    const source = detectSource(url);
    switch (source) {
      case "youtube": return Youtube;
      case "linkedin": return Linkedin;
      default: return Globe;
    }
  };

  const SourceIcon = url ? getSourceIcon(url) : Link2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <DialogHeader className="p-4 lg:p-6 pb-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 lg:h-10 w-8 lg:w-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 lg:h-5 w-4 lg:w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg lg:text-xl font-semibold">Add New Content</DialogTitle>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Let AI analyze and organize your content automatically
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 lg:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center space-x-2">
                <Link2 className="h-4 w-4" />
                <span>URL/Link</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload File</span>
              </TabsTrigger>
            </TabsList>

            {/* URL Tab */}
            <TabsContent value="url" className="space-y-6 mt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-medium">
                    URL or Link
                  </Label>
                  <div className="relative">
                    <SourceIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10"
                      disabled={isProcessing}
                    />
                  </div>
                  {url && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <SourceIcon className="h-3 w-3" />
                      <span>Detected source: {detectSource(url)}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any personal notes or context about this content..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isProcessing}
                  />
                </div>

                {/* AI Processing Info */}
                <div className="p-3 lg:p-4 rounded-lg bg-gradient-to-r from-accent/20 to-primary/10 border border-accent/20">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-4 lg:h-5 w-4 lg:w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs lg:text-sm font-medium">AI Processing Included</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Automatic content extraction and summarization</li>
                        <li>• Intelligent tagging based on content analysis</li>
                        <li className="hidden sm:block">• Key insights and takeaways generation</li>
                        <li className="hidden sm:block">• Source detection and metadata extraction</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:shadow-glow"
                  disabled={!url || isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Processing with AI...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Add & Process with AI</span>
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6 mt-6">
              <div className="space-y-4">
                
                {/* File Input */}
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.docx,.txt,.doc"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* Drag & Drop Area */}
                <label 
                  htmlFor="file-upload" 
                  className="block border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-accent/5 transition-smooth cursor-pointer"
                >
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Drop files here or click to browse</p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOCX, TXT files up to 10MB
                    </p>
                  </div>
                </label>

                {selectedFile && (
                  <div className="p-3 bg-accent/10 rounded-lg border">
                    <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()} 
                  variant="outline" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </>
                  )}
                </Button>

                {/* AI Processing Info */}
                <div className="p-3 lg:p-4 rounded-lg bg-gradient-to-r from-accent/20 to-primary/10 border border-accent/20">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-4 lg:h-5 w-4 lg:w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs lg:text-sm font-medium">AI Document Analysis</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Text extraction from PDF and Word documents</li>
                        <li>• Intelligent content summarization</li>
                        <li className="hidden sm:block">• Automatic topic and keyword identification</li>
                        <li className="hidden sm:block">• Document structure analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AddContentModal;