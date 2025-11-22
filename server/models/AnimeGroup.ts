import mongoose, { Schema, Document, Types } from 'mongoose';

interface IEntry {
  type: 'start' | 'update' | 'complete';
  thoughts: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  adminApproved: boolean;
}

interface IAnimeLink {
  label: string;
  url: string;
}

export interface IAnimeGroup extends Document {
  userId: Types.ObjectId;
  animeName: string;
  genre: string;
  totalEpisodes: number;
  links: IAnimeLink[];
  entries: IEntry[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: Date;
}

const entrySchema = new Schema({
  type: {
    type: String,
    enum: ['start', 'update', 'complete'],
    required: true,
  },
  thoughts: {
    type: String,
    required: true,
    minlength: 10,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  adminApproved: {
    type: Boolean,
    default: false,
  },
});

const animeLinkSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const animeGroupSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  animeName: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  totalEpisodes: {
    type: Number,
    required: true,
    min: 1,
  },
  links: {
    type: [animeLinkSchema],
    default: [],
  },
  entries: {
    type: [entrySchema],
    default: [],
  },
  coverImage: {
    type: String,
    default: null,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const AnimeGroup = mongoose.model<IAnimeGroup>('AnimeGroup', animeGroupSchema);
