
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, LogOut, User, Coins, Folder, Home, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Secure File Encryption</h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Encrypt
              </Button>
            </Link>
            <Link to="/file-banks">
              <Button 
                variant={location.pathname === '/file-banks' ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Folder className="h-4 w-4" />
                File Banks
              </Button>
            </Link>
            <Link to="/subscription">
              <Button 
                variant={location.pathname === '/subscription' ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Coins className="h-4 w-4" />
                Subscription
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button 
                  variant={location.pathname === '/admin' ? 'default' : 'ghost'} 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || user?.email} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {isAdmin && (
                  <p className="text-xs leading-none text-orange-600 font-medium">
                    Administrator
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span>Points: {profile?.points || 0}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {profile?.subscription_tier || 'free'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-600"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
