import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { completeEntrySchema } from '@shared/schema';
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
import { Loader2, CheckCircle2 } from 'lucide-react';

type CompleteFormData = z.infer<typeof completeEntrySchema>;

interface CompleteAnimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animeGroupId: string;
}

export function CompleteAnimeDialog({ open, onOpenChange, animeGroupId }: CompleteAnimeDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CompleteFormData>({
    resolver: zodResolver(completeEntrySchema),
    defaultValues: {
      thoughts: '',
      endDate: new Date().toISOString().split('T')[0],
      endTime: new Date().toTimeString().slice(0, 5),
    },
  });

  const onSubmit = async (data: CompleteFormData) => {
    setIsLoading(true);
    try {
      await api.post(`/anime/${animeGroupId}/complete`, data);
      queryClient.invalidateQueries({ queryKey: ['/anime', animeGroupId] });
      queryClient.invalidateQueries({ queryKey: ['/anime/my-anime'] });
      queryClient.invalidateQueries({ queryKey: ['/anime/feed'] });
      toast({
        title: 'Anime completed!',
        description: 'Your completion entry is pending admin approval',
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Failed to complete anime',
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-['Poppins'] text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Complete Anime
          </DialogTitle>
          <DialogDescription>
            Share your final thoughts and mark this anime as complete
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-end-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-end-time" />
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
                  <FormLabel>Final Thoughts</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your overall experience, favorite parts, final rating..."
                      className="min-h-40"
                      {...field}
                      data-testid="input-complete-thoughts"
                    />
                  </FormControl>
                  <FormDescription>
                    How was the ending? Would you recommend it? What's your final verdict?
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
              <Button type="submit" disabled={isLoading} data-testid="button-submit-complete">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Completing...' : 'Mark as Complete'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
