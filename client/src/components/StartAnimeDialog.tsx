import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertAnimeGroupSchema } from '@shared/schema';
import type { z } from 'zod';
import { api } from '@/utils/api';
import { queryClient } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2 } from 'lucide-react';

type StartAnimeFormData = z.infer<typeof insertAnimeGroupSchema>;

interface StartAnimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartAnimeDialog({ open, onOpenChange }: StartAnimeDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>('');
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([
    { label: '', url: '' },
  ]);

  const form = useForm<StartAnimeFormData>({
    resolver: zodResolver(insertAnimeGroupSchema),
    defaultValues: {
      animeName: '',
      genre: '',
      totalEpisodes: 12,
      links: [{ label: '', url: '' }],
      thoughts: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toTimeString().slice(0, 5),
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: StartAnimeFormData) => {
    setIsLoading(true);
    try {
      await api.post('/anime', { ...data, coverImage });
      await queryClient.refetchQueries({ queryKey: ['/anime/my-anime'] });
      await queryClient.refetchQueries({ queryKey: ['/anime/feed'] });
      toast({
        title: 'Anime started!',
        description: 'Your anime is private. Request to make it public for others to see.',
      });
      onOpenChange(false);
      form.reset();
      setLinks([{ label: '', url: '' }]);
      setCoverImage('');
    } catch (error: any) {
      toast({
        title: 'Failed to start anime',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLink = () => {
    const newLinks = [...links, { label: '', url: '' }];
    setLinks(newLinks);
    form.setValue('links', newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    form.setValue('links', newLinks);
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
    form.setValue('links', newLinks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins'] text-2xl">Start New Anime</DialogTitle>
          <DialogDescription>
            Share your anime journey with the community
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="animeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anime Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Attack on Titan" {...field} data-testid="input-anime-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="Action, Fantasy" {...field} data-testid="input-genre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalEpisodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Episodes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                      data-testid="input-total-episodes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Cover Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    data-testid="input-cover-image"
                  />
                  {coverImage && (
                    <div className="relative w-32 h-48 rounded-md overflow-hidden border">
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>Upload an anime cover image (PNG, JPG, etc.)</FormDescription>
            </FormItem>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Anime Links</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                  data-testid="button-add-link"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
              </div>
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Label (e.g., Crunchyroll)"
                    value={link.label}
                    onChange={e => updateLink(index, 'label', e.target.value)}
                    data-testid={`input-link-label-${index}`}
                  />
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={e => updateLink(index, 'url', e.target.value)}
                    data-testid={`input-link-url-${index}`}
                  />
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(index)}
                      data-testid={`button-remove-link-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <FormMessage>{form.formState.errors.links?.message}</FormMessage>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-start-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-start-time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="thoughts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Thoughts</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your expectations and first impressions..."
                      className="min-h-32"
                      {...field}
                      data-testid="input-thoughts"
                    />
                  </FormControl>
                  <FormDescription>
                    What made you start this anime? What are you looking forward to?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Creating...' : 'Start Anime'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
