import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicFeed() {
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ['/users/public'],
  });

  const getInitials = (username: string) => username.slice(0, 2).toUpperCase();

  

  const UserCard = ({ user }: { user: any }) => {
    return (
      <Link href={`/user/${user._id}`}>
        <Card className="hover-elevate active-elevate-2 transition-all overflow-hidden cursor-pointer" data-testid={`card-user-${user._id}`}>
          {user.previewCoverImage && (
            <div className="relative w-full h-32 overflow-hidden bg-muted">
              <img src={user.previewCoverImage} alt={user.previewAnimeName || 'Anime cover'} className="w-full h-full object-cover" />
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="font-['Poppins'] text-lg hover:text-primary transition-colors">
                  {user.username}
                </CardTitle>
                <CardDescription className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View timeline and anime activity</p>
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
          <h1 className="font-['Poppins'] text-3xl font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">Browse all users and view their anime timelines</p>
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
        ) : !users || users.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary mx-auto mb-4">
              <span className="font-['Poppins'] text-2xl font-bold text-primary-foreground">A</span>
            </div>
            <h3 className="font-['Poppins'] text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">Create an account to join the community</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <UserCard key={u._id} user={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
