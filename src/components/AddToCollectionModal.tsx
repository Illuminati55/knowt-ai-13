import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useContent";
import { toast } from "@/hooks/use-toast";
import { Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
}

const AddToCollectionModal = ({ isOpen, onClose, contentId }: AddToCollectionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const { collections } = useContent();

  const handleToggleCollection = (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const handleSave = async () => {
    if (selectedCollections.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one collection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Add to selected collections
      const insertPromises = Array.from(selectedCollections).map(collectionId =>
        supabase.from('collection_items').insert({
          collection_id: collectionId,
          content_id: contentId
        })
      );

      await Promise.all(insertPromises);

      toast({
        title: "Success",
        description: `Added to ${selectedCollections.size} collection(s)`,
      });
      onClose();
      setSelectedCollections(new Set());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collections</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {collections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No collections found.</p>
              <p className="text-sm">Create a collection first to organize your content.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCollections.has(collection.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleToggleCollection(collection.id)}
                >
                  <div 
                    className="h-4 w-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: collection.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{collection.name}</h4>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {selectedCollections.has(collection.id) ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || selectedCollections.size === 0}
            >
              {loading ? "Adding..." : `Add to ${selectedCollections.size} Collection(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionModal;