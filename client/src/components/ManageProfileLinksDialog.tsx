import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { ProfileLink } from '@shared/schema';

interface ManageProfileLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageProfileLinksDialog({ open, onOpenChange }: ManageProfileLinksDialogProps) {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [animeSites, setAnimeSites] = useState<ProfileLink[]>([]);
  const [mangaSites, setMangaSites] = useState<ProfileLink[]>([]);

  useEffect(() => {
    if (user && open) {
      setAnimeSites(user.profileLinks.animeSites || []);
      setMangaSites(user.profileLinks.mangaSites || []);
    }
  }, [user, open]);

  const addAnimeLink = () => {
    setAnimeSites([...animeSites, { name: '', url: '' }]);
  };

  const addMangaLink = () => {
    setMangaSites([...mangaSites, { name: '', url: '' }]);
  };

  const removeAnimeLink = (index: number) => {
    setAnimeSites(animeSites.filter((_, i) => i !== index));
  };

  const removeMangaLink = (index: number) => {
    setMangaSites(mangaSites.filter((_, i) => i !== index));
  };

  const updateAnimeLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...animeSites];
    newLinks[index][field] = value;
    setAnimeSites(newLinks);
  };

  const updateMangaLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...mangaSites];
    newLinks[index][field] = value;
    setMangaSites(newLinks);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/users/profile-links', {
        animeSites: animeSites.filter(link => link.name && link.url),
        mangaSites: mangaSites.filter(link => link.name && link.url),
      });
      
      // Update local auth state
      if (user) {
        const token = localStorage.getItem('token');
        if (token) {
          login(token, response.data.user);
        }
      }
      
      toast({
        title: 'Profile links updated!',
        description: 'Your profile links have been saved',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Failed to update links',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins'] text-2xl">Manage Profile Links</DialogTitle>
          <DialogDescription>
            Add links to your anime and manga tracking profiles on other platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Anime Sites */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Anime Sites</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnimeLink}
                data-testid="button-add-anime-site"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Anime Site
              </Button>
            </div>
            {animeSites.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No anime sites added</p>
            ) : (
              <div className="space-y-2">
                {animeSites.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Site name (e.g., MyAnimeList)"
                      value={link.name}
                      onChange={e => updateAnimeLink(index, 'name', e.target.value)}
                      data-testid={`input-anime-name-${index}`}
                    />
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={e => updateAnimeLink(index, 'url', e.target.value)}
                      data-testid={`input-anime-url-${index}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAnimeLink(index)}
                      data-testid={`button-remove-anime-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Manga Sites */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Manga Sites</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMangaLink}
                data-testid="button-add-manga-site"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Manga Site
              </Button>
            </div>
            {mangaSites.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No manga sites added</p>
            ) : (
              <div className="space-y-2">
                {mangaSites.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Site name (e.g., MangaDex)"
                      value={link.name}
                      onChange={e => updateMangaLink(index, 'name', e.target.value)}
                      data-testid={`input-manga-name-${index}`}
                    />
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={e => updateMangaLink(index, 'url', e.target.value)}
                      data-testid={`input-manga-url-${index}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMangaLink(index)}
                      data-testid={`button-remove-manga-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} data-testid="button-save-links">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : 'Save Links'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
