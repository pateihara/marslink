//src/types/api.ts
export type UserRole = "CREW" | "CONTROL";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};

export type Mission = {
  id: string;
  name: string;
  code: string;
  currentDay: number;
  phase: string;
  status: string;
  distanceKm: number;
  delayMinutes: number;
  signalQuality: number;
};

export type LoginResponse = {
  token: string;
  user: User;
  mission: Mission;
};

export type Message = {
  id: string;
  content: string;
  priority: string;
  status: string;
  delayMinutes: number;
  createdAt: string;
  sender: User;
  receiver?: User | null;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDay?: number | null;
  imageUrl?: string | null;
  assignee?: User | null;
  createdBy: User;
};

export type CommunicationWindow = {
  id: string;
  isOpen: boolean;
  signalQuality: number;
  delayMinutes: number;
  opensAt: string;
  closesAt: string;
  mission: Mission;
};

export type MissionLog = {
  id: string;
  missionId: string;
  authorId: string;
  title: string;
  content: string;
  mood: "CALM" | "FOCUSED" | "TIRED" | "STRESSED" | "ALERT";
  imageUrl?: string | null;
  createdAt: string;
  author: User;
};

export type UploadImageResponse = {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
};
