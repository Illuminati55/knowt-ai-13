import { useState } from "react";
import { Search, Plus, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "./AuthProvider";
import AddContentModal from "./AddContentModal";

const Header = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-card-border bg-card/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <div className="h-4 w-4 rounded bg-white/20 backdrop-blur-sm" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary-glow animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Curator
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">AI Knowledge Hub</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your knowledge base..."
                className="pl-10 bg-muted/50 border-muted-foreground/20 focus:bg-card transition-smooth"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="gradient" 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-primary" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer hover:shadow-glow transition-smooth">
                  <User className="h-4 w-4 text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 border-b">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Curator User</p>
                </div>
                <DropdownMenuItem onClick={signOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <AddContentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
};

export default Header;