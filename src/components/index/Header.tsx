
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { ExportFormat } from '@/lib/exportUtils';
import { 
  FileText, 
  Download, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown, 
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  onExport: (format: ExportFormat) => void;
  businessName: string;
}

const Header = ({ onExport, businessName }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isBusinessNameDialogOpen, setIsBusinessNameDialogOpen] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState(businessName);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to get user's display name or email
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.user_metadata?.full_name || user.email || 'User';
  };

  // Helper function to get avatar initials
  const getAvatarInitials = () => {
    if (!user) return 'U';
    const name = user.user_metadata?.full_name || user.email || '';
    return name.charAt(0).toUpperCase();
  };

  // Helper function to get avatar image URL
  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || '';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveBusinessName = async () => {
    try {
      await localStorage.setItem('businessName', newBusinessName);
      toast({
        title: 'Success',
        description: 'Business name updated successfully.',
      });
      setIsBusinessNameDialogOpen(false);
      window.location.reload(); // Refresh to show the new name
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update business name.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="glass border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold cursor-pointer" 
              onClick={() => setIsBusinessNameDialogOpen(true)}
            >
              {businessName}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl()} alt={getUserDisplayName()} />
                    <AvatarFallback>{getAvatarInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{getUserDisplayName()}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={getAvatarUrl()} alt={getUserDisplayName()} />
                  <AvatarFallback>{getAvatarInitials()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{getUserDisplayName()}</span>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="space-y-1 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onExport('csv');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onExport('json');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Business Name Dialog */}
      <Dialog open={isBusinessNameDialogOpen} onOpenChange={setIsBusinessNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Business Name</DialogTitle>
            <DialogDescription>
              Change the name of your business that appears in the header.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Name
              </Label>
              <Input
                id="businessName"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBusinessNameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBusinessName}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
