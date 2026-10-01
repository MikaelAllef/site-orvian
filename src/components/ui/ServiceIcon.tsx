/**
 * Converte o nome de ícone do catálogo (`services.ts`) no componente do Lucide.
 * Mantém o catálogo livre de dependências de interface.
 */
import { Camera, Compass, Instagram, Layers, Megaphone, Monitor, Package, Palette, PenTool, Workflow, Wrench } from 'lucide-react';
import type { ServiceIconName } from '../../data/services';

const ICONS: Record<ServiceIconName, typeof Palette> = {
  palette: Palette,
  pen: PenTool,
  instagram: Instagram,
  monitor: Monitor,
  camera: Camera,
  workflow: Workflow,
  layers: Layers,
  megaphone: Megaphone,
  package: Package,
  compass: Compass,
  wrench: Wrench,
};

export function ServiceIcon({ name, className }: { name: ServiceIconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
