import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { username, email } = req.body as { username?: string; email?: string };

    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!username && !email) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    if (username && username !== user.username) {
      const existingByUsername = await User.findOne({ username });
      if (existingByUsername && existingByUsername._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (email && email.toLowerCase() !== user.email) {
      const normalizedEmail = email.toLowerCase();
      const existingByEmail = await User.findOne({ email: normalizedEmail });
      if (existingByEmail && existingByEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = normalizedEmail;
    }

    await user.save();

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileLinks: user.profileLinks,
      createdAt: user.createdAt,
    };

    res.json({ user: userResponse });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile links
router.put('/profile-links', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { animeSites, mangaSites } = req.body;

    const user = await User.findById(req.user!._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileLinks = {
      animeSites: animeSites || [],
      mangaSites: mangaSites || [],
    };

    await user.save();

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileLinks: user.profileLinks,
      createdAt: user.createdAt,
    };

    res.json({ user: userResponse });
  } catch (error: any) {
    console.error('Error updating profile links:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public users listing with search and aggregation
router.get('/public', async (req, res: Response) => {
  try {
    const search = (req.query.search as string | undefined)?.trim();

    const match = search ? { $text: { $search: search } } : {};

    const results = await User.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'animegroups',
          let: { uid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$uid'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { coverImage: 1, animeName: 1 } },
          ],
          as: 'latestGroup',
        },
      },
      {
        $addFields: {
          previewCoverImage: { $arrayElemAt: ['$latestGroup.coverImage', 0] },
          previewAnimeName: { $arrayElemAt: ['$latestGroup.animeName', 0] },
        },
      },
      { $project: { username: 1, role: 1, profileLinks: 1, createdAt: 1, previewCoverImage: 1, previewAnimeName: 1 } },
    ]);

    res.json(results);
  } catch (error: any) {
    console.error('Error fetching public users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public single user fetch
router.get('/:id', async (req, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('username profileLinks createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
