export type SlotKey =
  | 'meta'
  | 'audience'
  | 'offer'
  | 'proof'
  | 'seo'
  | 'message'
  | 'distribution'
  | 'legals'
  | 'creative';

export interface SlotState {
  slot_key: SlotKey;
  weight: number;
  coverage: number; // 0..1
  confidence: number; // 0..1
  is_blocker: boolean;
  notes?: string;
}

export interface SessionPublic {
  partner_name: string;
  topic: string;
  progress: number;
  threshold: number;
  language: 'es' | 'en';
}

export interface NextQuestion {
  target_slot: SlotKey;
  question: string;
  why_this_question: string;
}
