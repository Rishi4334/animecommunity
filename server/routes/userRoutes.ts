import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

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

export default router;
