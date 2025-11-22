import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { api } from '@/utils/api';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, PlayCircle, Edit, CheckCircle2, Clock } from 'lucide-react';
import { AnimeGroupWithUser, Entry } from '@shared/schema';
import { format } from 'date-fns';

export default function PublicFeed() {
  const { data: feed, isLoading } = useQuery<AnimeGroupWithUser[]>({
    queryKey: ['/anime/feed'],
  });

  const getInitials = (username: string) => username.slice(0, 2).toUpperCase();

  const getEntryIcon = (type: Entry['type']) => {
    const icons = {
      start: PlayCircle,
      update: Edit,
      complete: CheckCircle2,
    };
    return icons[type];
  };

  const getEntryBadgeColor = (type: Entry['type']) => {
    const colors = {
      start: 'bg-blue-500',
      update: 'bg-yellow-500',
      complete: 'bg-green-500',
    };
    return colors[type];
  };

  const EntryCard = ({ group, entry }: { group: AnimeGroupWithUser; entry: Entry }) => {
    const Icon = getEntryIcon(entry.type);
    const badgeColor = getEntryBadgeColor(entry.type);

    return (
      <Card className="hover-elevate active-elevate-2 transition-all" data-testid={`card-entry-${group._id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(group.user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{group.user.username}</p>
                <div className={`h-2 w-2 rounded-full ${badgeColor}`} />
                <span className="text-xs text-muted-foreground capitalize">{entry.type}</span>
              </div>
              <Link href={`/anime/${group._id}`}>
                <CardTitle className="font-['Poppins'] text-lg hover:text-primary transition-colors cursor-pointer">
                  {group.animeName}
                </CardTitle>
              </Link>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{group.genre}</span>
                <span>•</span>
                <span className="font-mono text-xs">{group.totalEpisodes} episodes</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm line-clamp-3">{entry.thoughts}</p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>
            {entry.startTime && <span>• {entry.startTime}</span>}
            {entry.endTime && <span>• {entry.endTime}</span>}
          </div>

          {group.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant="outline" className="gap-1 hover-elevate cursor-pointer">
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </Badge>
                </a>
              ))}
            </div>
          )}

          {/* User Profile Links */}
          {(group.user.profileLinks.animeSites.length > 0 || group.user.profileLinks.mangaSites.length > 0) && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">User's profiles:</p>
              <div className="flex flex-wrap gap-2">
                {group.user.profileLinks.animeSites.map((site, idx) => (
                  <a
                    key={idx}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge variant="secondary" className="text-xs gap-1 hover-elevate cursor-pointer">
                      <ExternalLink className="h-3 w-3" />
                      {site.name}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          )}

          <Link href={`/anime/${group._id}`}>
            <button className="text-sm text-primary hover:underline font-medium" data-testid={`button-view-thread-${group._id}`}>
              View full thread →
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] text-3xl font-bold mb-2">Public Feed</h1>
          <p className="text-muted-foreground">Discover what the community is watching</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !feed || feed.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary mx-auto mb-4">
              <span className="font-['Poppins'] text-2xl font-bold text-primary-foreground">A</span>
            </div>
            <h3 className="font-['Poppins'] text-lg font-semibold mb-2">No approved entries yet</h3>
            <p className="text-muted-foreground">Start tracking anime to see content here!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.flatMap(group =>
              group.entries
                .filter(entry => entry.adminApproved)
                .map((entry, idx) => (
                  <EntryCard key={`${group._id}-${idx}`} group={group} entry={entry} />
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
