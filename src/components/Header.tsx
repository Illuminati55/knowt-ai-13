import { useState } from "react";
import { Search, Plus, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "./AuthProvider";
import AddContentModal from "./AddContentModal";
import NotificationPanel from "./NotificationPanel";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <div className="h-4 w-4 rounded bg-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Curator AI
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Knowledge Hub</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your knowledge base..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-primary" />
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
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
      
      <NotificationPanel 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};

export default Header;