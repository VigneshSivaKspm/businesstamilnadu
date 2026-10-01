import {
  Briefcase,
  Car,
  Cpu,
  Factory,
  GraduationCap,
  HardHat,
  Landmark,
  Megaphone,
  PartyPopper,
  Plane,
  ShoppingBag,
  Sparkles,
  Sprout,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryIconKey } from '@/types';

const categoryIcons: Record<CategoryIconKey, LucideIcon> = {
  professional: Briefcase,
  healthcare: Stethoscope,
  'real-estate': HardHat,
  education: GraduationCap,
  food: UtensilsCrossed,
  travel: Plane,
  automobile: Car,
  'home-services': Wrench,
  events: PartyPopper,
  beauty: Sparkles,
  technology: Cpu,
  manufacturing: Factory,
  agriculture: Sprout,
  retail: ShoppingBag,
  finance: Landmark,
  media: Megaphone,
  logistics: Truck,
};

export function CategoryIcon({ icon, className }: { icon: CategoryIconKey; className?: string }) {
  const Icon = categoryIcons[icon];
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
