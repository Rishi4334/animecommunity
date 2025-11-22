import mongoose, { Schema, Document } from 'mongoose';

interface IProfileLink {
  name: string;
  url: string;
}

interface IProfileLinks {
  animeSites: IProfileLink[];
  mangaSites: IProfileLink[];
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'normal';
  profileLinks: IProfileLinks;
  createdAt: Date;
}

const profileLinkSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
});

const profileLinksSchema = new Schema({
  animeSites: { type: [profileLinkSchema], default: [] },
  mangaSites: { type: [profileLinkSchema], default: [] },
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'normal'],
    default: 'normal',
  },
  profileLinks: {
    type: profileLinksSchema,
    default: () => ({ animeSites: [], mangaSites: [] }),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ username: 'text', email: 'text' });

export const User = mongoose.model<IUser>('User', userSchema);
