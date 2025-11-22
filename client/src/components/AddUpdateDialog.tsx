import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateEntrySchema } from '@shared/schema';
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
import { Loader2 } from 'lucide-react';

type UpdateFormData = z.infer<typeof updateEntrySchema>;

interface AddUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animeGroupId: string;
}

export function AddUpdateDialog({ open, onOpenChange, animeGroupId }: AddUpdateDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateEntrySchema),
    defaultValues: {
      thoughts: '',
    },
  });

  const onSubmit = async (data: UpdateFormData) => {
    setIsLoading(true);
    try {
      await api.post(`/anime/${animeGroupId}/update`, data);
      queryClient.invalidateQueries({ queryKey: ['/anime', animeGroupId] });
      queryClient.invalidateQueries({ queryKey: ['/anime/my-anime'] });
      queryClient.invalidateQueries({ queryKey: ['/anime/feed'] });
      toast({
        title: 'Update added!',
        description: 'Your update is pending admin approval',
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Failed to add update',
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
          <DialogTitle className="font-['Poppins'] text-2xl">Add Update</DialogTitle>
          <DialogDescription>
            Share your progress and thoughts about this anime
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="thoughts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Thoughts</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what you've watched, your favorite moments, plot developments..."
                      className="min-h-40"
                      {...field}
                      data-testid="input-update-thoughts"
                    />
                  </FormControl>
                  <FormDescription>
                    What episodes did you watch? What's happening in the story?
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
              <Button type="submit" disabled={isLoading} data-testid="button-submit-update">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Adding...' : 'Add Update'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
