import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Users, TrendingUp, Award } from 'lucide-react';
import { AdminStats } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';
import { queryClient } from '@/lib/queryClient';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/admin/stats'],
  });

  const [search, setSearch] = useState('');
  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/users/public', search],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/users/public'] });
      queryClient.invalidateQueries({ queryKey: ['/admin/stats'] });
      toast({ title: 'User deleted', description: 'Profile removed successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete', description: error.response?.data?.message || 'An error occurred', variant: 'destructive' });
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
          <p className="text-muted-foreground">Platform statistics and user directory</p>
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
            {/* Removed pending entries in simplified portal */}
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

        {/* User Directory */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins'] text-2xl">User Directory</CardTitle>
            <CardDescription>Search users and view profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <input
                className="w-full px-3 py-2 rounded-md border bg-background"
                placeholder="Search by username or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <a href={`/user/${u._id}`} className="text-primary hover:underline">View</a>
                            {u.role !== 'admin' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Delete user ${u.username}? This will remove all their anime groups.`)) {
                                    deleteUserMutation.mutate(u._id);
                                  }
                                }}
                                disabled={deleteUserMutation.isPending}
                              >
                                Delete
                              </Button>
                            )}
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
