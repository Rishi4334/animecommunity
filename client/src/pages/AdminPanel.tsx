import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { queryClient } from '@/lib/queryClient';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Users, Clock, TrendingUp, Award, Loader2 } from 'lucide-react';
import { PendingEntry, AdminStats } from '@shared/schema';
import { format } from 'date-fns';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/admin/stats'],
  });

  const { data: pendingEntries, isLoading: entriesLoading } = useQuery<PendingEntry[]>({
    queryKey: ['/admin/pending-entries'],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ animeGroupId, entryIndex }: { animeGroupId: string; entryIndex: number }) => {
      return api.post(`/admin/approve-entry/${animeGroupId}/${entryIndex}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/pending-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/anime/feed'] });
      toast({
        title: 'Entry approved',
        description: 'The entry is now visible in the public feed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to approve',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ animeGroupId, entryIndex }: { animeGroupId: string; entryIndex: number }) => {
      return api.post(`/admin/reject-entry/${animeGroupId}/${entryIndex}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/pending-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/admin/stats'] });
      toast({
        title: 'Entry rejected',
        description: 'The entry has been removed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to reject',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h3 className="font-['Poppins'] text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access the admin panel</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-['Poppins'] text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage user entries and view platform statistics</p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardDescription>
                <CardTitle className="text-3xl font-['Poppins']">{stats.totalUsers}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Entries
                </CardDescription>
                <CardTitle className="text-3xl font-['Poppins']">{stats.pendingEntries}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Anime
                </CardDescription>
                <CardTitle className="text-3xl font-['Poppins']">{stats.totalAnimeGroups}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Completion Rate
                </CardDescription>
                <CardTitle className="text-3xl font-['Poppins']">{stats.completionRate.toFixed(0)}%</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Pending Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins'] text-2xl">Pending Entries</CardTitle>
            <CardDescription>Review and approve user submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : !pendingEntries || pendingEntries.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-['Poppins'] text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No pending entries to review</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Anime</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Thoughts Preview</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingEntries.map((pending) => (
                      <TableRow key={`${pending.animeGroupId}-${pending.entryIndex}`} data-testid={`pending-entry-${pending._id}`}>
                        <TableCell className="font-medium">{pending.username}</TableCell>
                        <TableCell>{pending.animeName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pending.entry.type === 'start'
                                ? 'default'
                                : pending.entry.type === 'complete'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {pending.entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(pending.entry.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm line-clamp-2">{pending.entry.thoughts}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                approveMutation.mutate({
                                  animeGroupId: pending.animeGroupId,
                                  entryIndex: pending.entryIndex,
                                })
                              }
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              data-testid={`button-approve-${pending._id}`}
                            >
                              {approveMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                rejectMutation.mutate({
                                  animeGroupId: pending.animeGroupId,
                                  entryIndex: pending.entryIndex,
                                })
                              }
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              data-testid={`button-reject-${pending._id}`}
                            >
                              {rejectMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
