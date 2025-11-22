import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AddUpdateDialog } from '@/components/AddUpdateDialog';
import { CompleteAnimeDialog } from '@/components/CompleteAnimeDialog';
import {
  PlayCircle,
  Edit,
  CheckCircle2,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { AnimeGroup as AnimeGroupType, Entry } from '@shared/schema';
import { format } from 'date-fns';

export default function AnimeGroup() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const { data: group, isLoading } = useQuery<AnimeGroupType>({
    queryKey: ['/anime', id],
    enabled: !!id,
  });

  const isOwner = user?._id === group?.userId;
  const lastEntry = group?.entries[group.entries.length - 1];
  const isCompleted = lastEntry?.type === 'complete';

  const getEntryIcon = (type: Entry['type']) => {
    const icons = {
      start: PlayCircle,
      update: Edit,
      complete: CheckCircle2,
    };
    return icons[type];
  };

  const getEntryColor = (type: Entry['type']) => {
    const colors = {
      start: 'text-blue-500',
      update: 'text-yellow-500',
      complete: 'text-green-500',
    };
    return colors[type];
  };

  const EntryTimeline = ({ entry, index }: { entry: Entry; index: number }) => {
    const Icon = getEntryIcon(entry.type);
    const color = getEntryColor(entry.type);
    const isLast = index === (group?.entries.length || 0) - 1;

    return (
      <div className="flex gap-4" data-testid={`entry-${index}`}>
        {/* Timeline Line */}
        <div className="flex flex-col items-center">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${entry.adminApproved ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
            <Icon className={`h-4 w-4 ${entry.adminApproved ? 'text-primary-foreground' : color}`} />
          </div>
          {!isLast && <div className="w-0.5 flex-1 bg-border min-h-12" />}
        </div>

        {/* Entry Content */}
        <div className="flex-1 pb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base capitalize">{entry.type}</CardTitle>
                    {entry.adminApproved ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 font-mono text-xs">
                    <Clock className="h-3 w-3" />
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                    {entry.startTime && ` • ${entry.startTime}`}
                    {entry.endTime && ` • ${entry.endTime}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{entry.thoughts}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h3 className="font-['Poppins'] text-lg font-semibold mb-2">Anime not found</h3>
            <p className="text-muted-foreground mb-4">This anime group doesn't exist</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          {group.coverImage && (
            <div className="relative w-full h-40 overflow-hidden bg-muted rounded-md mb-4">
              <img src={group.coverImage} alt={group.animeName} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="font-['Poppins'] text-3xl font-bold mb-2">{group.animeName}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Badge variant="secondary">{group.genre}</Badge>
            <span className="font-mono text-sm">{group.totalEpisodes} episodes</span>
            <span className="text-sm">{group.entries.length} entries</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Poppins'] text-xl font-semibold">Timeline</h2>
              {isOwner && !isCompleted && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpdateDialog(true)}
                    data-testid="button-add-update"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Update
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowCompleteDialog(true)}
                    data-testid="button-complete"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark Complete
                  </Button>
                </div>
              )}
            </div>

            {group.entries.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No entries yet</p>
              </Card>
            ) : (
              <div className="space-y-0">
                {group.entries.map((entry, index) => (
                  <EntryTimeline key={index} entry={entry} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Anime Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Watch Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                      <ExternalLink className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Status */}
            {isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This anime has been marked as complete
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {isOwner && (
        <>
          <AddUpdateDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            animeGroupId={group._id!}
          />
          <CompleteAnimeDialog
            open={showCompleteDialog}
            onOpenChange={setShowCompleteDialog}
            animeGroupId={group._id!}
          />
        </>
      )}
    </div>
  );
}
