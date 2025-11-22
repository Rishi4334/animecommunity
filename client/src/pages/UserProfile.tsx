import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ManageProfileLinksDialog } from '@/components/ManageProfileLinksDialog';
import {
  Clock,
  CheckCircle,
  ExternalLink,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { AnimeGroup } from '@shared/schema';

export default function UserProfile() {
  const params = useParams();
  const viewedUserId = params?.id;
  const { user } = useAuth();
  const [showLinksDialog, setShowLinksDialog] = useState(false);

  const { data: animeGroups, isLoading } = useQuery<AnimeGroup[]>({
    queryKey: viewedUserId ? ['/anime/user', viewedUserId] : ['/anime/my-anime'],
  });

  const { data: viewedUser } = useQuery<any>({
    queryKey: viewedUserId ? ['/users', viewedUserId] : ['/users', user?._id || 'me'],
    enabled: !!viewedUserId,
  });

  const watching = animeGroups?.filter(group => {
    const lastEntry = group.entries[group.entries.length - 1];
    return lastEntry?.type !== 'complete';
  }) || [];

  const completed = animeGroups?.filter(group => {
    const lastEntry = group.entries[group.entries.length - 1];
    return lastEntry?.type === 'complete';
  }) || [];

  const getInitials = (username: string) => username.slice(0, 2).toUpperCase();

  const AnimeCard = ({ group }: { group: AnimeGroup }) => (
    <Link href={`/anime/${group._id}`}>
      <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer overflow-hidden" data-testid={`profile-card-${group._id}`}>
        {group.coverImage && (
          <div className="relative w-full h-32 overflow-hidden bg-muted">
            <img src={group.coverImage} alt={group.animeName} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-['Poppins'] text-lg">{group.animeName}</CardTitle>
          <CardDescription>{group.genre}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono">{group.totalEpisodes} eps</span>
            <span>{group.entries.length} entries</span>
          </div>
          {group.entries.length > 0 && (
            <p className="text-sm line-clamp-2">
              {group.entries[group.entries.length - 1].thoughts}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  const displayUser = viewedUserId ? viewedUser : user;


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {getInitials(displayUser?.username || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-['Poppins'] text-2xl font-bold">{displayUser?.username}</h1>
                  {displayUser?.role === 'admin' && (
                    <Badge variant="default">Admin</Badge>
                  )}
                </div>
                {displayUser?.email && (
                  <p className="text-muted-foreground mb-4">{displayUser.email}</p>
                )}

                {/* Profile Links */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">My Anime/Manga Sites</h3>
                    {!viewedUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLinksDialog(true)}
                      data-testid="button-manage-links"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Manage Links
                    </Button>
                    )}
                  </div>

                  {displayUser?.profileLinks?.animeSites?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Anime Sites:</p>
                      <div className="flex flex-wrap gap-2">
                        {displayUser.profileLinks.animeSites.map((site: any, idx: number) => (
                          <a
                            key={idx}
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Badge variant="secondary" className="gap-1 hover-elevate cursor-pointer">
                              <ExternalLink className="h-3 w-3" />
                              {site.name}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {displayUser?.profileLinks?.mangaSites?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Manga Sites:</p>
                      <div className="flex flex-wrap gap-2">
                        {displayUser.profileLinks.mangaSites.map((site: any, idx: number) => (
                          <a
                            key={idx}
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Badge variant="secondary" className="gap-1 hover-elevate cursor-pointer">
                              <ExternalLink className="h-3 w-3" />
                              {site.name}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!displayUser?.profileLinks || (displayUser.profileLinks.animeSites.length === 0 && displayUser.profileLinks.mangaSites.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">
                      No profile links added yet. Click "Manage Links" to add your anime/manga profiles.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Watching</CardDescription>
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

        {/* Anime Lists */}
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
          </TabsList>

          <TabsContent value="watching">
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
                <h3 className="font-['Poppins'] text-lg font-semibold mb-2">Not watching anything</h3>
                <p className="text-muted-foreground">Start tracking anime from your dashboard!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watching.map(group => (
                  <AnimeCard key={group._id} group={group} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
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
                <h3 className="font-['Poppins'] text-lg font-semibold mb-2">No completed anime</h3>
                <p className="text-muted-foreground">Complete an anime to see it here!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map(group => (
                  <AnimeCard key={group._id} group={group} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {!viewedUserId && (
        <ManageProfileLinksDialog open={showLinksDialog} onOpenChange={setShowLinksDialog} />
      )}
    </div>
  );
}
