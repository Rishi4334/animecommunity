import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Home, User, LayoutDashboard, Shield, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/feed', label: 'Public Feed', icon: Home },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard">
            <button className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="font-['Poppins'] text-lg font-bold text-primary-foreground">A</span>
              </div>
              <span className="font-['Poppins'] text-xl font-bold hidden sm:inline">Anime Tracker</span>
            </button>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.path;
              return (
                <Link key={link.path} href={link.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2"
                    data-testid={`nav-${link.path.slice(1)}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle & User Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {user.username}
                    {isAdmin && (
                      <Badge variant="default" className="text-xs px-1.5 py-0">Admin</Badge>
                    )}
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <div className="flex items-center gap-2 cursor-pointer w-full">
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <div className="flex items-center gap-2 cursor-pointer w-full">
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
