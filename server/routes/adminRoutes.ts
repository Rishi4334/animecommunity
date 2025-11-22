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

    const pendingEntries = allGroups.reduce((count, group) => {
      return count + group.entries.filter(e => !e.adminApproved).length;
    }, 0);

    const completedGroups = allGroups.filter(group => {
      const lastEntry = group.entries[group.entries.length - 1];
      return lastEntry?.type === 'complete';
    }).length;

    const completionRate = totalAnimeGroups > 0 ? (completedGroups / totalAnimeGroups) * 100 : 0;

    res.json({
      totalUsers,
      pendingEntries,
      totalAnimeGroups,
      completionRate,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending anime posts (requests to make public)
router.get('/pending-entries', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const animeGroups = await AnimeGroup.find();

    const pendingEntries = (
      await Promise.all(
        animeGroups.map(async (group) => {
          const user = await User.findById(group.userId).select('username');
          return group.entries
            .map((entry, index) => ({ entry, index }))
            .filter(e => !e.entry.adminApproved)
            .map(e => ({
              _id: `${group._id}-${e.index}`,
              animeGroupId: group._id.toString(),
              animeName: group.animeName,
              username: user?.username || 'Unknown',
              userId: group.userId.toString(),
              entryIndex: e.index,
              entry: e.entry,
              createdAt: group.createdAt.toISOString(),
            }));
        })
      )
    ).flat();

    pendingEntries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json(pendingEntries);
  } catch (error: any) {
    console.error('Error fetching pending posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve anime post (make public)
router.post('/approve-entry/:groupId/:entryIndex', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, entryIndex } = req.params;
    const idx = parseInt(entryIndex, 10);

    const group = await AnimeGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Anime group not found' });
    }
    if (idx < 0 || idx >= group.entries.length) {
      return res.status(400).json({ message: 'Invalid entry index' });
    }

    group.entries[idx].adminApproved = true;
    group.isPublic = true;
    await group.save();

    res.json({ message: 'Entry approved', animeGroup: group });
  } catch (error: any) {
    console.error('Error approving entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject anime post (keep private)
router.post('/reject-entry/:groupId/:entryIndex', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, entryIndex } = req.params;
    const idx = parseInt(entryIndex, 10);

    const group = await AnimeGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Anime group not found' });
    }
    if (idx < 0 || idx >= group.entries.length) {
      return res.status(400).json({ message: 'Invalid entry index' });
    }

    group.entries.splice(idx, 1);
    if (group.entries.every(e => !e.adminApproved)) {
      group.isPublic = false;
    }
    await group.save();

    res.json({ message: 'Entry rejected', animeGroup: group });
  } catch (error: any) {
    console.error('Error rejecting entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Delete a non-admin user and all their anime groups
router.delete('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }

    const deletedGroups = await AnimeGroup.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    res.json({
      message: 'User deleted',
      deletedUserId: id,
      deletedAnimeGroups: deletedGroups.deletedCount || 0,
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
