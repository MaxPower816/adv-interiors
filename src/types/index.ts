export type NavItem = {
  label: string;
  href: string;
};

export type Project = {
  slug: string;
  title: string;
  city: string;
  area: string;
  year: string;
  type: string;
  description: string;
  works: string[];
  cover: string;
  images: string[];
  layout: string;
  characteristics: Record<string, string>;
};

export type PricePlan = {
  id: string;
  title: string;
  price: string;
  duration: string;
  features: string[];
};

export type RoomStage = {
  id: string;
  start: number;
  end: number;
  label: string;
  text: string;
  subtext?: string;
  side: "left" | "right";
  objects: string[];
};

export type Vec3Tuple = [x: number, y: number, z: number];

export type CameraKeyframe = {
  id: string;
  progress: number;
  position: Vec3Tuple;
  lookAt: Vec3Tuple;
  mouse?: {
    x: number;
    y: number;
  };
  damping?: number;
};

export type LeadStatus =
  | "new"
  | "contact"
  | "brief-scheduled"
  | "brief-done"
  | "proposal"
  | "thinking"
  | "contract"
  | "refused"
  | "closed"
  | "in-progress"
  | "waiting";

export type LeadActivityTrailItem = {
  name: string;
  path: string;
  createdAt: string;
  payload?: Record<string, string | number | boolean>;
};

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  objectType: string;
  area: string;
  city: string;
  budget: string;
  service: string;
  startDate: string;
  comment?: string;
  managerNote?: string;
  source?: string;
  utm?: Record<string, string>;
  activityTrail?: LeadActivityTrailItem[];
  nextAction?: string;
  nextActionAt?: string;
  potentialValue?: string;
  lostReason?: string;
};

export type ActivityEvent = {
  id: string;
  createdAt: string;
  name: string;
  path: string;
  referrer?: string;
  payload?: Record<string, string | number | boolean>;
};
