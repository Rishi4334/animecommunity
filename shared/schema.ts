import { z } from "zod";

// ============================================
// User Schema & Types
// ============================================

export const profileLinkSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  url: z.string().url("Invalid URL"),
});

export const profileLinksSchema = z.object({
  animeSites: z.array(profileLinkSchema).default([]),
  mangaSites: z.array(profileLinkSchema).default([]),
});

export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "normal"]).default("normal"),
  profileLinks: profileLinksSchema.default({ animeSites: [], mangaSites: [] }),
  createdAt: z.date().or(z.string()).optional(),
});

export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ProfileLink = z.infer<typeof profileLinkSchema>;
export type ProfileLinks = z.infer<typeof profileLinksSchema>;

// ============================================
// Entry Schema & Types (Timeline entries)
// ============================================

export const entrySchema = z.object({
  type: z.enum(["start", "update", "complete"]),
  thoughts: z.string().min(1, "Thoughts are required"),
  date: z.date().or(z.string()),
  startTime: z.string().optional(), // Only for type=start (HH:MM format)
  endTime: z.string().optional(),   // Only for type=complete (HH:MM format)
  adminApproved: z.boolean().default(false),
});

export const insertEntrySchema = entrySchema.omit({ date: true, adminApproved: true });

export type Entry = z.infer<typeof entrySchema>;
export type InsertEntry = z.infer<typeof insertEntrySchema>;

// ============================================
// Anime Link Schema
// ============================================

export const animeLinkSchema = z.object({
  label: z.string().min(1, "Link label is required"),
  url: z.string().url("Invalid URL"),
});

export type AnimeLink = z.infer<typeof animeLinkSchema>;

// ============================================
// AnimeGroup Schema & Types
// ============================================

export const animeGroupSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  animeName: z.string().min(1, "Anime name is required"),
  genre: z.string().min(1, "Genre is required"),
  totalEpisodes: z.number().min(1, "Total episodes must be at least 1"),
  links: z.array(animeLinkSchema).default([]),
  entries: z.array(entrySchema).default([]),
  coverImage: z.string().optional(),
  isPublic: z.boolean().default(false),
  createdAt: z.date().or(z.string()).optional(),
});

export const insertAnimeGroupSchema = z.object({
  animeName: z.string().min(1, "Anime name is required"),
  genre: z.string().min(1, "Genre is required"),
  totalEpisodes: z.number().min(1, "Total episodes must be at least 1"),
  links: z.array(animeLinkSchema).min(1, "At least one anime link is required"),
  thoughts: z.string().min(10, "Share your initial thoughts (min 10 characters)"),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  coverImage: z.string().optional(),
});

export const updateEntrySchema = z.object({
  thoughts: z.string().min(10, "Share your thoughts (min 10 characters)"),
});

export const completeEntrySchema = z.object({
  thoughts: z.string().min(10, "Share your final thoughts (min 10 characters)"),
  endDate: z.string().min(1, "Completion date is required"),
  endTime: z.string().min(1, "Completion time is required"),
});

export type AnimeGroup = z.infer<typeof animeGroupSchema>;
export type InsertAnimeGroup = z.infer<typeof insertAnimeGroupSchema>;
export type UpdateEntry = z.infer<typeof updateEntrySchema>;
export type CompleteEntry = z.infer<typeof completeEntrySchema>;

// ============================================
// API Response Types
// ============================================

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface AnimeGroupWithUser extends AnimeGroup {
  user: {
    username: string;
    profileLinks: ProfileLinks;
  };
}

export interface PendingEntry {
  _id: string;
  animeGroupId: string;
  animeName: string;
  username: string;
  userId: string;
  entryIndex: number;
  entry: Entry;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  pendingEntries: number;
  totalAnimeGroups: number;
  completionRate: number;
}
