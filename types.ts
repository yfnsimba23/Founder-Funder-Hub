
export type UserRole = 'Founder' | 'Funder';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  fullName: string;
  photoURL: string;
  // Founder specific
  startupName?: string;
  oneLinePitch?: string;
  industry?: string;
  fundingStage?: string;
  pitchDeckUrl?: string;
  myAsk?: string;
  // Funder specific
  firmName?: string;
  investmentThesis?: string;
  preferredStage?: string;
  whatIOffer?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    fullName: string;
    photoURL: string;
    role: UserRole;
  };
  content: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

export interface Conversation {
  id: string; // e.g., sorted uid1_uid2
  participants: UserProfile[];
  lastMessage: Message | null;
}

export interface UserEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
}
