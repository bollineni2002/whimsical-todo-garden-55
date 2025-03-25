
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { RefreshCw, LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSyncStatus } from '@/hooks/useSyncStatus';

interface AuthHeaderProps {
  businessName?: string;
  onEditName?: () => void;
}

const AuthHeader = ({ businessName = 'TransactLy', onEditName }: AuthHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isSyncing, isAllSynced, sync, lastSyncTime } = useSyncStatus();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <header className="bg-background sticky top-0 z-10 border-b border-border">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-primary-foreground" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">{businessName}</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sync button */}
          <Button 
            variant={isAllSynced ? "outline" : "default"}
            size="sm"
            className={`gap-2 ${!isAllSynced ? 'animate-pulse' : ''}`}
            onClick={sync}
            disabled={isSyncing}
          >
            <RefreshCw 
              className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} 
            />
            {isSyncing ? 'Syncing...' : isAllSynced ? 'Synced' : 'Sync Now'}
          </Button>
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                {user?.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>
      </div>
      
      {/* Sync status indicator */}
      {lastSyncTime && (
        <div className="container mx-auto px-4 py-1 text-xs text-muted-foreground">
          Last synced: {new Date(lastSyncTime).toLocaleString()}
        </div>
      )}
    </header>
  );
};

export default AuthHeader;
