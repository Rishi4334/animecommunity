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
      return count + group.entries.filter(entry => !entry.adminApproved).length;
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

// Get pending entries
router.get('/pending-entries', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const animeGroups = await AnimeGroup.find();
    
    const pendingEntries: any[] = [];
    
    for (const group of animeGroups) {
      const user = await User.findById(group.userId).select('username');
      
      group.entries.forEach((entry, index) => {
        if (!entry.adminApproved) {
          pendingEntries.push({
            _id: `${group._id}-${index}`,
            animeGroupId: group._id,
            animeName: group.animeName,
            username: user?.username || 'Unknown',
            userId: group.userId,
            entryIndex: index,
            entry,
            createdAt: entry.date,
          });
        }
      });
    }

    pendingEntries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json(pendingEntries);
  } catch (error: any) {
    console.error('Error fetching pending entries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve entry
router.post('/approve-entry/:groupId/:entryIndex', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, entryIndex } = req.params;
    
    const animeGroup = await AnimeGroup.findById(groupId);
    
    if (!animeGroup) {
      return res.status(404).json({ message: 'Anime group not found' });
    }

    const index = parseInt(entryIndex);
    
    if (index < 0 || index >= animeGroup.entries.length) {
      return res.status(400).json({ message: 'Invalid entry index' });
    }

    animeGroup.entries[index].adminApproved = true;
    await animeGroup.save();

    res.json({ message: 'Entry approved', animeGroup });
  } catch (error: any) {
    console.error('Error approving entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject entry (delete it)
router.post('/reject-entry/:groupId/:entryIndex', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, entryIndex } = req.params;
    
    const animeGroup = await AnimeGroup.findById(groupId);
    
    if (!animeGroup) {
      return res.status(404).json({ message: 'Anime group not found' });
    }

    const index = parseInt(entryIndex);
    
    if (index < 0 || index >= animeGroup.entries.length) {
      return res.status(400).json({ message: 'Invalid entry index' });
    }

    animeGroup.entries.splice(index, 1);
    
    // If no entries left, delete the group
    if (animeGroup.entries.length === 0) {
      await AnimeGroup.findByIdAndDelete(groupId);
      return res.json({ message: 'Entry rejected and group deleted (no entries left)' });
    }

    await animeGroup.save();

    res.json({ message: 'Entry rejected', animeGroup });
  } catch (error: any) {
    console.error('Error rejecting entry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
