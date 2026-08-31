import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: string;
  variation?: string;
}

const colorMap: Record<string, string> = {
  green: 'bg-primary/5',
  blue: 'bg-info/5',
  orange: 'bg-warning/5',
  red: 'bg-destructive/5',
  grey: 'bg-info/5',
};

const iconColorMap: Record<string, string> = {
  green: 'text-primary',
  blue: 'text-info',
  orange: 'text-warning',
  red: 'text-destructive',
  grey: 'text-info',
};

const StatsCard = ({ icon: Icon, value, label, color, variation }: StatsCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`medibook-card ${colorMap[color] || colorMap.green} flex items-center gap-4 cursor-default`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColorMap[color] || ''} bg-card`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {variation && <p className="text-xs font-medium text-primary">{variation}</p>}
      </div>
    </motion.div>
  );
};

export default StatsCard;
