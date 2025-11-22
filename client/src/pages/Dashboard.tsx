import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { AnimeGroup } from '@shared/schema';
import { StartAnimeDialog } from '@/components/StartAnimeDialog';

export default function Dashboard() {
  const { user } = useAuth();
  const [showStartDialog, setShowStartDialog] = useState(false);

  const { data: animeGroups, isLoading } = useQuery<AnimeGroup[]>({
    queryKey: ['/anime/my-anime'],
    enabled: !!user?._id,
    refetchOnMount: true,
  });

  const watching = animeGroups?.filter(group => {
    const lastEntry = group.entries[group.entries.length - 1];
    return lastEntry?.type !== 'complete';
  }) || [];

  const completed = animeGroups?.filter(group => {
    const lastEntry = group.entries[group.entries.length - 1];
    return lastEntry?.type === 'complete';
  }) || [];

  const getStatusBadge = (group: AnimeGroup) => {
    const lastEntry = group.entries[group.entries.length - 1];
    if (!lastEntry) return null;

    const variants = {
      start: { variant: 'default' as const, label: 'Started', color: 'bg-blue-500' },
      update: { variant: 'secondary' as const, label: 'Watching', color: 'bg-yellow-500' },
      complete: { variant: 'default' as const, label: 'Completed', color: 'bg-green-500' },
    };

    const config = variants[lastEntry.type];
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${config.color}`} />
        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
      </div>
    );
  };

  const AnimeCard = ({ group }: { group: AnimeGroup }) => {
    const lastEntry = group.entries[group.entries.length - 1];

    return (
      <Link href={`/anime/${group._id}`}>
        <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer h-full overflow-hidden" data-testid={`card-anime-${group._id}`}>
          {group.coverImage && (
            <div className="relative w-full h-40 overflow-hidden bg-muted">
              <img src={group.coverImage} alt={group.animeName} className="w-full h-full object-cover" />
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-['Poppins'] truncate">{group.animeName}</CardTitle>
                <CardDescription className="text-sm">{group.genre}</CardDescription>
              </div>
              {getStatusBadge(group)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{group.totalEpisodes} eps</span>
              <span>{group.entries.length} entries</span>
            </div>
            
            {lastEntry && (
              <p className="text-sm line-clamp-2">{lastEntry.thoughts}</p>
            )}

            
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-['Poppins'] text-3xl font-bold mb-2">My Dashboard</h1>
              <p className="text-muted-foreground">Track and manage your anime journey</p>
            </div>
            <Button onClick={() => setShowStartDialog(true)} size="lg" data-testid="button-start-anime">
              <Plus className="h-5 w-5 mr-2" />
              Start New Anime
            </Button>
          </div>

          {/* Quick Stats */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Currently Watching</CardDescription>
                  <CardTitle className="text-3xl font-['Poppins']">{watching.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl font-['Poppins']">{completed.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Entries</CardDescription>
                  <CardTitle className="text-3xl font-['Poppins']">
                    {animeGroups?.reduce((sum, g) => sum + g.entries.length, 0) || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>

        <Tabs defaultValue="watching" className="space-y-6">
          <TabsList>
            <TabsTrigger value="watching" data-testid="tab-watching">
              <Clock className="h-4 w-4 mr-2" />
              Watching ({watching.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              <TrendingUp className="h-4 w-4 mr-2" />
              All ({animeGroups?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watching" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : watching.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-['Poppins'] text-lg font-semibold mb-2">No anime in progress</h3>
                <p className="text-muted-foreground mb-4">Start tracking your anime journey!</p>
                <Button onClick={() => setShowStartDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Anime
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watching.map(group => (
                  <AnimeCard key={group._id} group={group} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : completed.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-['Poppins'] text-lg font-semibold mb-2">No completed anime yet</h3>
                <p className="text-muted-foreground">Complete your first anime to see it here!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map(group => (
                  <AnimeCard key={group._id} group={group} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !animeGroups || animeGroups.length === 0 ? (
              <Card className="p-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-['Poppins'] text-lg font-semibold mb-2">Start your anime journey</h3>
                <p className="text-muted-foreground mb-4">Begin tracking your favorite anime shows!</p>
                <Button onClick={() => setShowStartDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Anime
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animeGroups.map(group => (
                  <AnimeCard key={group._id} group={group} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <StartAnimeDialog open={showStartDialog} onOpenChange={setShowStartDialog} />
    </div>
  );
}
