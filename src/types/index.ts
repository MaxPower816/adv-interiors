export type NavItem = {
  label: string;
  href: string;
};

export type Project = {
  id?: string;
  slug: string;
  title: string;
  city: string;
  area: string;
  year: string;
  type: string;
  description: string;
  challenge?: string;
  solution?: string;
  materials?: string;
  result?: string;
  works: string[];
  cover: string;
  images: string[];
  layout: string;
  characteristics: Record<string, string>;
  published?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
};

export type SiteStat = {
  value: number;
  suffix: string;
  label: string;
};

export type SiteService = {
  title: string;
  text: string;
};

export type SiteProcessStep = {
  title: string;
  text: string;
};

export type SiteSeoBlock = {
  eyebrow: string;
  title: string;
  text: string;
  items: string[];
};

export type SiteBeforeAfter = {
  eyebrow: string;
  title: string;
  beforeImage: string;
  afterImage: string;
};

export type SiteTestimonial = {
  name: string;
  project: string;
  city: string;
  text: string;
};

export type SitePricingObjectType = {
  key: string;
  label: string;
  min: string;
  note: string;
};

export type SiteContact = {
  eyebrow: string;
  title: string;
  text: string;
  successTitle: string;
  successText: string;
};

export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    finalCta: string;
  };
  about: {
    title: string;
    text: string;
    image: string;
    stats: SiteStat[];
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  services: {
    eyebrow: string;
    title: string;
    text: string;
    items: SiteService[];
  };
  process: {
    eyebrow: string;
    title: string;
    text: string;
    steps: SiteProcessStep[];
  };
  seoBlock: SiteSeoBlock;
  beforeAfter: SiteBeforeAfter;
  testimonials: {
    eyebrow: string;
    title: string;
    items: SiteTestimonial[];
  };
  pricing: {
    eyebrow: string;
    title: string;
    backgroundImage: string;
    objectTypes: SitePricingObjectType[];
    plans: PricePlan[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: [string, string][];
  };
  contact: SiteContact;
};

export type MediaItem = {
  id: string;
  createdAt: string;
  title: string;
  url: string;
  alt: string;
  kind: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
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
