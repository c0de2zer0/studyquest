'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Shield, Zap, Brain, Heart,
  Shirt, GraduationCap, ShoppingBag, ChevronRight,
  Eye, Mountain, Star, Clock, Flame, Medal,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { mockEvolutionTree } from '@/lib/mock-data';
import { cn, formatHours } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

// ─── Constants ──────────────────────────────────────────────────────────────

const STATS_CONFIG = [
  { key: 'focus' as const, label: 'Odak', icon: Eye, color: 'cyan' as const },
  { key: 'speed' as const, label: 'H\u0131z', icon: Zap, color: 'gold' as const },
  { key: 'endurance' as const, label: 'Dayan\u0131kl\u0131l\u0131k', icon: Heart, color: 'emerald' as const },
  { key: 'memory' as const, label: 'Haf\u0131za', icon: Brain, color: 'purple' as const },
];

const EQUIPMENT_SLOTS = [
  { slot: 'hat' as const, label: '\u015eapka', icon: <GraduationCap className="w-4 h-4" /> },
  { slot: 'hair' as const, label: 'Sa\u00e7', icon: <Star className="w-4 h-4" /> },
  { slot: 'top' as const, label: '\u00dcst', icon: <Shirt className="w-4 h-4" /> },
  { slot: 'bottom' as const, label: 'Alt', icon: <ShoppingBag className="w-4 h-4" /> },
  { slot: 'shoes' as const, label: 'Ayakkab\u0131', icon: <Zap className="w-4 h-4" /> },
  { slot: 'accessory' as const, label: 'Aksesuar', icon: <Sparkles className="w-4 h-4" /> },
  { slot: 'background' as const, label: 'Arka Plan', icon: <Mountain className="w-4 h-4" /> },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

// ─── Pixel Avatar Renderer ──────────────────────────────────────────────────

function PixelAvatarSVG({
  equippedItems,
  items,
  avatarGlowColor,
}: {
  equippedItems: Record<string, string | null>;
  items: Array<{ id: string; name: string; category: string; emoji: string; rarity: string }>;
  avatarGlowColor: string;
}) {
  const getEquipped = (slot: string) =>
    items.find((i) => i.id === equippedItems[slot]);

  const hatItem = getEquipped('hat');
  const hairItem = getEquipped('hair');
  const topItem = getEquipped('top');
  const bottomItem = getEquipped('bottom');
  const shoesItem = getEquipped('shoes');
  const accessoryItem = getEquipped('accessory');
  const bgItem = getEquipped('background');

  const skinColor = '#f5c6a0';
  const eyeWhite = '#ffffff';
  const pupilColor = '#2d1b14';
  const mouthColor = '#c97b63';
  const hairColor = '#5c3a21';
  const pantsColor = '#3b3b5c';
  const shirtColor = '#6b3fa0';
  const shoeColor = '#2d2d44';

  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-2xl opacity-20 blur-2xl"
        style={{
          background: `radial-gradient(circle at center, ${avatarGlowColor} 0%, transparent 70%)`,
        }}
      />
      <svg
        viewBox="0 0 16 32"
        className="w-full h-full relative z-10"
        style={{ imageRendering: 'pixelated' }}
      >
        {bgItem ? (
          <rect x="0" y="0" width="16" height="32" rx="0" fill="#1a1a3e" />
        ) : (
          <rect x="0" y="0" width="16" height="32" rx="0" fill="#141428" />
        )}

        {bottomItem ? (
          <>
            <rect x="4" y="22" width="3" height="7" fill="#4a4a8a" rx="0.5" />
            <rect x="9" y="22" width="3" height="7" fill="#4a4a8a" rx="0.5" />
          </>
        ) : (
          <>
            <rect x="4" y="22" width="3" height="7" fill={pantsColor} rx="0.5" />
            <rect x="9" y="22" width="3" height="7" fill={pantsColor} rx="0.5" />
          </>
        )}

        {shoesItem ? (
          <>
            <rect x="3" y="29" width="4" height="3" fill="#6666aa" rx="0.5" />
            <rect x="9" y="29" width="4" height="3" fill="#6666aa" rx="0.5" />
          </>
        ) : (
          <>
            <rect x="3" y="29" width="4" height="3" fill={shoeColor} rx="0.5" />
            <rect x="9" y="29" width="4" height="3" fill={shoeColor} rx="0.5" />
          </>
        )}

        {topItem ? (
          <rect x="3" y="10" width="10" height="12" rx="1" fill="#7b5cf6" />
        ) : (
          <rect x="3" y="10" width="10" height="12" rx="1" fill={shirtColor} />
        )}

        {topItem ? (
          <>
            <rect x="0" y="10" width="3" height="8" rx="0.5" fill="#8b6cf7" />
            <rect x="13" y="10" width="3" height="8" rx="0.5" fill="#8b6cf7" />
          </>
        ) : (
          <>
            <rect x="0" y="10" width="3" height="8" rx="0.5" fill={skinColor} />
            <rect x="13" y="10" width="3" height="8" rx="0.5" fill={skinColor} />
          </>
        )}

        <rect x="0" y="17" width="3" height="3" rx="0.5" fill={skinColor} />
        <rect x="13" y="17" width="3" height="3" rx="0.5" fill={skinColor} />
        <rect x="6" y="9" width="4" height="2" rx="0.5" fill={skinColor} />
        <rect x="3" y="1" width="10" height="9" rx="1.5" fill={skinColor} />

        {hairItem ? (
          <>
            <rect x="3" y="0" width="10" height="3" rx="1" fill="#a855f7" />
            <rect x="2" y="1" width="2" height="4" rx="0.5" fill="#a855f7" />
            <rect x="12" y="1" width="2" height="4" rx="0.5" fill="#a855f7" />
          </>
        ) : (
          <>
            <rect x="3" y="0" width="10" height="3" rx="1" fill={hairColor} />
            <rect x="2" y="1" width="2" height="4" rx="0.5" fill={hairColor} />
            <rect x="12" y="1" width="2" height="4" rx="0.5" fill={hairColor} />
          </>
        )}

        {hatItem && (
          <>
            <rect x="2" y="0" width="12" height="2" rx="0.5" fill="#a855f7" />
            <rect x="4" y="0" width="8" height="1" fill="#c084fc" />
          </>
        )}

        <rect x="5" y="4" width="2" height="2" rx="0.5" fill={eyeWhite} />
        <rect x="9" y="4" width="2" height="2" rx="0.5" fill={eyeWhite} />
        <rect x="6" y="5" width="1" height="1" fill={pupilColor} />
        <rect x="10" y="5" width="1" height="1" fill={pupilColor} />
        <rect x="6" y="7" width="4" height="1" rx="0.5" fill={mouthColor} />

        {accessoryItem && (
          <>
            <rect x="13" y="12" width="2" height="2" rx="0.5" fill="#f59e0b" />
            <rect x="14" y="13" width="1" height="3" rx="0.5" fill="#f59e0b" opacity="0.5" />
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Equipment Slot Card ────────────────────────────────────────────────────

function EquipmentSlot({
  label,
  icon,
  item,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  item: { id: string; name: string; emoji: string; rarity: string } | undefined;
  onClick?: () => void;
}) {
  const rarityColors: Record<string, string> = {
    common: 'border-[var(--border-subtle)]',
    rare: 'border-[#00f0ff]/40',
    epic: 'border-[#8b5cf6]/40',
    legendary: 'border-[#ffd700]/40',
  };

  const rarityGlow: Record<string, string> = {
    common: '',
    rare: 'shadow-[0_0_12px_-3px_rgba(0,240,255,0.12)]',
    epic: 'shadow-[0_0_12px_-3px_rgba(139,92,246,0.12)]',
    legendary: 'shadow-[0_0_12px_-3px_rgba(255,215,0,0.12)]',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 shadow-sm cursor-pointer',
        'bg-[var(--bg-card)]',
        item ? rarityColors[item.rarity] ?? rarityColors.common : 'border-[var(--border-color)]',
        item ? rarityGlow[item.rarity] ?? '' : '',
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
        item ? 'bg-[var(--bg-hover)]' : 'bg-[var(--bg-hover)]',
      )}
      style={{ color: item ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {item ? <span className="text-lg">{item.emoji}</span> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="text-sm truncate" style={{ color: item ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {item ? item.name : 'Bo\u015f'}
        </p>
      </div>
      {item && (
        <Badge
          variant={
            item.rarity === 'rare' ? 'info' :
            item.rarity === 'epic' ? 'purple' :
            item.rarity === 'legendary' ? 'warning' : 'default'
          }
          size="sm"
        >
          {item.rarity}
        </Badge>
      )}
    </motion.div>
  );
}

// ─── Evolution Tree ─────────────────────────────────────────────────────────

function EvolutionTree({ currentForm }: { currentForm: string }) {
  const nodes = mockEvolutionTree;

  return (
    <div className="space-y-0.5">
      {nodes.map((node, idx) => {
        const isCurrent = node.current;
        const isUnlocked = node.unlocked;
        const isLast = idx === nodes.length - 1;

        return (
          <div key={node.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.08, type: 'spring' as const, stiffness: 200 }}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all duration-300',
                  isCurrent
                    ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10 shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]'
                    : isUnlocked
                      ? 'border-emerald-500/30 bg-emerald-50'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-hover)] opacity-50',
                )}
              >
                <span className={cn(isCurrent && 'animate-pulse')}>{node.emoji}</span>
              </motion.div>
              {!isLast && (
                <div className={cn(
                  'w-0.5 h-6',
                  isUnlocked ? 'bg-[#8b5cf6]/30' : 'bg-[var(--border-subtle)]',
                )} />
              )}
            </div>

            <div className="flex-1 pt-1.5 pb-2">
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-[#8b5cf6]' : isUnlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]',
                )}>
                  {node.name}
                </p>
                {isCurrent && <Badge variant="purple" size="sm" dot>Aktif</Badge>}
                {!isUnlocked && (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {node.reqHours}sa
                  </span>
                )}
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {isUnlocked
                  ? isCurrent
                    ? '\u015eu anki formun'
                    : `${node.reqHours}+ saatte a\u00e7\u0131l\u0131r`
                  : `Hen\u00fcz a\u00e7\u0131lmad\u0131 (${node.reqHours}sa)`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Avatar Page ────────────────────────────────────────────────────────────

export default function AvatarPage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const items = useStore((s) => s.items);
  const setMarketCategory = useStore((s) => s.setMarketCategory);

  const stats = user.stats;
  const avatar = user.avatar;

  const itemMap = useMemo(() => {
    const map = new Map<string, (typeof items)[number]>();
    for (const item of items) {
      map.set(item.id, item);
    }
    return map;
  }, [items]);

  const getEquippedItem = (slot: string) => {
    const raw = user.equippedItems as Record<string, string | null>;
    const id = raw[slot];
    return id ? itemMap.get(id) : undefined;
  };

  const equippedCount = EQUIPMENT_SLOTS.filter((s) => {
    const raw = user.equippedItems as Record<string, string | null>;
    return raw[s.slot] != null;
  }).length;

  const handleSlotClick = (slot: string) => {
    setMarketCategory(slot);
    router.push('/market');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-7 h-7 text-[#a78bfa]" />
            Avatar
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            {user.emoji} {user.avatar.tier} &middot; {user.avatar.rarity}
          </p>
        </div>
        <Badge variant="purple" size="md" dot>
          {user.name}
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Avatar Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar with 3D hover effect */}
          <motion.div variants={itemVariants}>
            <div className="relative group perspective-[800px]">
              <motion.div
                whileHover={{ rotateY: 5, rotateX: -5 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="transition-transform duration-300"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card className="flex flex-col items-center py-8" glow="purple">
                  {/* Idle bob animation */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-48 h-96"
                  >
                    <PixelAvatarSVG
                      equippedItems={user.equippedItems as Record<string, string | null>}
                      items={items}
                      avatarGlowColor={avatar.glowColor}
                    />
                  </motion.div>
                  <div className="text-center mt-4">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {user.emoji} {user.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {user.rank}
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Medal className="w-4 h-4 text-[#ffd700]" />
                H\u0131zl\u0131 \u0130statistikler
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Clock, label: 'Toplam', value: formatHours(user.totalHours), color: '#00f0ff' },
                  { icon: Flame, label: 'Seri', value: `${user.streak} g\u00fcn`, color: '#ffd700' },
                  { icon: Star, label: 'Seviye', value: `Lv.${user.level}`, color: '#8b5cf6' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Shield className="w-4 h-4 text-[#00f0ff]" />
                \u0130statistikler
              </h3>
              <div className="space-y-4">
                {STATS_CONFIG.map((stat) => {
                  const val = stats[stat.key];
                  const color = stat.color;
                  return (
                    <div key={stat.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <stat.icon className={cn(
                            'w-3.5 h-3.5',
                            color === 'cyan' && 'text-[#00f0ff]',
                            color === 'gold' && 'text-[#ffd700]',
                            color === 'emerald' && 'text-emerald-500',
                            color === 'purple' && 'text-[#8b5cf6]',
                          )} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {stat.label}
                          </span>
                        </div>
                        <span className={cn(
                          'text-xs font-bold',
                          color === 'cyan' && 'text-[#00f0ff]',
                          color === 'gold' && 'text-[#ffd700]',
                          color === 'emerald' && 'text-emerald-500',
                          color === 'purple' && 'text-[#8b5cf6]',
                        )}>
                          {val as number}
                        </span>
                      </div>
                      <ProgressBar value={val as number} color={color} size="sm" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Toplam S\u00fcre
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.totalHours} saat
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right: Equipment + Evolution */}
        <div className="lg:col-span-3 space-y-6">
          {/* Equipment Slots */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <ShoppingBag className="w-4 h-4 text-[#ffd700]" />
                  Ekipman
                </h3>
                <Badge variant="info" size="sm">
                  {equippedCount} donat\u0131lm\u0131\u015f
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EQUIPMENT_SLOTS.map((slotConfig) => (
                  <EquipmentSlot
                    key={slotConfig.slot}
                    label={slotConfig.label}
                    icon={slotConfig.icon}
                    item={getEquippedItem(slotConfig.slot)}
                    onClick={() => handleSlotClick(slotConfig.slot)}
                  />
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Evolution Tree */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Star className="w-4 h-4 text-[#ffd700]" />
                  Evrim A\u011fac\u0131
                </h3>
                <Button variant="ghost" size="sm" icon={ChevronRight}>
                  T\u00fcm\u00fcn\u00fc G\u00f6r
                </Button>
              </div>
              <EvolutionTree currentForm={avatar.currentForm} />
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="flex flex-wrap gap-3">
              <Button variant="primary" size="md" icon={ShoppingBag} onClick={() => router.push('/market')}>
                Marketi Ke\u015ffet
              </Button>
              <Button variant="secondary" size="md" icon={Star}>
                G\u00f6r\u00fcn\u00fcm\u00fc Kaydet
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
