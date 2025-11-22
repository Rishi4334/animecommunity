import { Switch, Route, Redirect } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import PublicFeed from '@/pages/PublicFeed';
import AnimeGroup from '@/pages/AnimeGroup';
import UserProfile from '@/pages/UserProfile';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/not-found';

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/feed" component={PublicFeed} />
      <Route path="/anime/:id">
        {() => <ProtectedRoute component={AnimeGroup} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={UserProfile} />}
      </Route>
      <Route path="/user/:id" component={UserProfile} />
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminPanel} />}
      </Route>
      <Route path="/">
        {() => <Redirect to="/dashboard" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
