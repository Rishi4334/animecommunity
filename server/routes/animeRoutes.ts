import { Router, Response } from 'express';
import { AnimeGroup } from '../models/AnimeGroup';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all user's anime groups
router.get('/my-anime', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const animeGroups = await AnimeGroup.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    res.json(animeGroups);
  } catch (error: any) {
    console.error('Error fetching anime groups:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get public feed (only approved/public anime posts)
router.get('/feed', async (_req, res: Response) => {
  try {
    const animeGroups = await AnimeGroup.find().sort({ createdAt: -1 }).limit(100);
    
    const groupsWithUsers = await Promise.all(
      animeGroups.map(async (group) => {
        const user = await User.findById(group.userId).select('username profileLinks');
        return {
          _id: group._id,
          userId: group.userId,
          animeName: group.animeName,
          genre: group.genre,
          totalEpisodes: group.totalEpisodes,
          links: group.links,
          entries: group.entries,
          coverImage: group.coverImage,
          isPublic: group.isPublic,
          createdAt: group.createdAt,
          user: {
            username: user?.username || 'Unknown',
            profileLinks: user?.profileLinks || { animeSites: [], mangaSites: [] },
          },
        };
      })
    );

    res.json(groupsWithUsers);
  } catch (error: any) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all anime groups for a specific user
router.get('/user/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const animeGroups = await AnimeGroup.find({ userId }).sort({ createdAt: -1 });
    res.json(animeGroups);
  } catch (error: any) {
    console.error('Error fetching user anime groups:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single anime group
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const animeGroup = await AnimeGroup.findById(req.params.id);
    
    if (!animeGroup) {
      return res.status(404).json({ message: 'Anime group not found' });
    }

    res.json(animeGroup);
  } catch (error: any) {
    console.error('Error fetching anime group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new anime group (start anime)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { animeName, genre, totalEpisodes, links, thoughts, startDate, startTime, coverImage } = req.body;

    const animeGroup = new AnimeGroup({
      userId: req.user!._id,
      animeName,
      genre,
      totalEpisodes,
      links,
      coverImage,
      entries: [
        {
          type: 'start',
          thoughts,
          date: new Date(startDate),
          startTime,
          adminApproved: false,
        },
      ],
    });

    await animeGroup.save();
    res.status(201).json(animeGroup);
  } catch (error: any) {
    console.error('Error creating anime group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add update entry
router.post('/:id/update', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { thoughts } = req.body;
    
    const animeGroup = await AnimeGroup.findById(req.params.id);
    
    if (!animeGroup) {
      return res.status(404).json({ message: 'Anime group not found' });
    }

    if (animeGroup.userId.toString() !== req.user!._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    animeGroup.entries.push({
      type: 'update',
      thoughts,
      date: new Date(),
      adminApproved: false,
    });

    await animeGroup.save();
    res.json(animeGroup);
  } catch (error: any) {
    console.error('Error adding update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete anime
router.post('/:id/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { thoughts, endDate, endTime } = req.body;
    
    const animeGroup = await AnimeGroup.findById(req.params.id);
    
    if (!animeGroup) {
      return res.status(404).json({ message: 'Anime group not found' });
    }

    if (animeGroup.userId.toString() !== req.user!._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    animeGroup.entries.push({
      type: 'complete',
      thoughts,
      date: new Date(endDate),
      endTime,
      adminApproved: false,
    });

    await animeGroup.save();
    res.json(animeGroup);
  } catch (error: any) {
    console.error('Error completing anime:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
