
export interface SkillPoint {
  subject: string;
  current: number;
  target: number;
}

export interface RoadmapStep {
  title: string;
  description: string;
  type: 'learning' | 'project' | 'networking';
  isLocked?: boolean;
}

export interface RedFlag {
  type: 'culture' | 'technical' | 'workload';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SalaryAdvice {
  range: string;
  marketContext: string;
  scripts: { title: string; text: string }[];
}

export interface ActionCard {
  type: 'fix' | 'improve' | 'great';
  title: string;
  message: string;
}

export interface CVAnalysisResult {
  roast: string;
  mentorAdvice: string;
  atsScore: number;
  skills: { name: string; level: number }[];
  radarData: SkillPoint[];
  missingSkills: string[];
  actionCards: ActionCard[];
  educationRecommendations: { title: string; platform: string; url: string }[];
  sideHustleIdeas: string[];
  sentimentScore: string;
}

export interface JobComparisonResult {
  matchRate: number;
  gaps: string[];
  roadmap: RoadmapStep[];
  actionPlan: string;
  redFlags: RedFlag[];
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  avatar?: string;
}

export interface UserState {
  xp: number;
  level: number;
  badges: string[];
  mode: 'mentor' | 'roast';
  profile: UserProfile;
}
