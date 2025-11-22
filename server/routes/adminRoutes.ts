import { Router, Response } from 'express';
import { AnimeGroup } from '../models/AnimeGroup';
import { User } from '../models/User';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get admin stats
router.get('/stats', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnimeGroups = await AnimeGroup.countDocuments();
    
    const allGroups = await AnimeGroup.find();
    const pendingPosts = allGroups.filter(group => !group.isPublic).length;

    const completedGroups = allGroups.filter(group => {
      const lastEntry = group.entries[group.entries.length - 1];
      return lastEntry?.type === 'complete';
    }).length;

    const completionRate = totalAnimeGroups > 0 ? (completedGroups / totalAnimeGroups) * 100 : 0;

    res.json({
      totalUsers,
      pendingPosts,
      totalAnimeGroups,
      completionRate,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending anime posts (requests to make public)
router.get('/pending-posts', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const animeGroups = await AnimeGroup.find({ isPublic: false });
    
    const pendingPosts = await Promise.all(
      animeGroups.map(async (group) => {
        const user = await User.findById(group.userId).select('username');
        return {
          _id: group._id,
          animeName: group.animeName,
          genre: group.genre,
          totalEpisodes: group.totalEpisodes,
          coverImage: group.coverImage,
          username: user?.username || 'Unknown',
          userId: group.userId,
          entriesCount: group.entries.length,
          createdAt: group.createdAt,
        };
      })
    );

    pendingPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json(pendingPosts);
  } catch (error: any) {
    console.error('Error fetching pending posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve anime post (make public)
router.post('/approve-post/:groupId', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    
    const animeGroup = await AnimeGroup.findByIdAndUpdate(
      groupId,
      { isPublic: true },
      { new: true }
    );
    
    if (!animeGroup) {
      return res.status(404).json({ message: 'Anime group not found' });
    }

    res.json({ message: 'Anime post approved and made public', animeGroup });
  } catch (error: any) {
    console.error('Error approving post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject anime post (keep private)
router.post('/reject-post/:groupId', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    
    const animeGroup = await AnimeGroup.findByIdAndUpdate(
      groupId,
      { isPublic: false },
      { new: true }
    );
    
    if (!animeGroup) {
      return res.status(404).json({ message: 'Anime group not found' });
    }

    res.json({ message: 'Entry rejected', animeGroup });
  } catch (error: any) {
    console.error('Error rejecting entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
