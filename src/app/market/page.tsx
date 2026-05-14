'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Coins, ShoppingBag, Check, Shirt, ArrowUpDown,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const CATEGORIES = [
  { id: 'all', label: 'T\u00fcm\u00fc' },
  { id: 'hat', label: '\u015eapka' },
  { id: 'hair', label: 'Sa\u00e7' },
  { id: 'top', label: '\u00dcst' },
  { id: 'bottom', label: 'Alt' },
  { id: 'shoes', label: 'Ayakkab\u0131' },
  { id: 'accessory', label: 'Aksesuar' },
  { id: 'background', label: 'Arka Plan' },
  { id: 'costume', label: 'Kost\u00fcm' },
];

const RARITIES = [
  { id: 'all', label: 'T\u00fcm\u00fc' },
  { id: 'common', label: 'Common' },
  { id: 'rare', label: 'Rare' },
  { id: 'epic', label: 'Epic' },
  { id: 'legendary', label: 'Legendary' },
];

const SORT_OPTIONS = [
  { id: 'rarity', label: 'Nadirlik' },
  { id: 'price-asc', label: 'Fiyat \u2191' },
  { id: 'price-desc', label: 'Fiyat \u2193' },
  { id: 'name', label: '\u0130sim A-Z' },
];

const rarityConfig: Record<string, { label: string; color: string; glowColor: string; badgeVariant: 'default' | 'info' | 'purple' | 'warning' }> = {
  common:    { label: 'Common', color: '#94a3b8', glowColor: 'rgba(148,163,184,0.15)', badgeVariant: 'default' },
  rare:      { label: 'Rare',   color: '#22d3ee', glowColor: 'rgba(34,211,238,0.15)', badgeVariant: 'info' },
  epic:      { label: 'Epic',   color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.15)', badgeVariant: 'purple' },
  legendary: { label: 'Legendary', color: '#ffd700', glowColor: 'rgba(255,215,0,0.15)', badgeVariant: 'warning' },
};

function AnimatedCoins({ balance }: { balance: number }) {
  const [display, setDisplay] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevRef = useRef(balance);

  useEffect(() => {
    if (prevRef.current !== balance) {
      setIsAnimating(true);
      const diff = balance - prevRef.current;
      const steps = 10;
      const stepVal = diff / steps;
      let current = prevRef.current;
      const interval = setInterval(() => {
        current += stepVal;
        setDisplay(Math.round(current * 10) / 10);
      }, 40);
      setTimeout(() => {
        clearInterval(interval);
        setDisplay(balance);
        setIsAnimating(false);
      }, 400);
      prevRef.current = balance;
    }
  }, [balance]);

  return (
    <motion.span
      className="font-bold text-sm tabular-nums"
      style={{ color: '#b8860b' }}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      {display.toFixed(1)}
    </motion.span>
  );
}

export default function MarketPage() {
  const {
    user,
    items,
    buyItem,
    equipItem,
    unequipItem,
    marketCategory,
    marketSearch,
    marketSort,
    setMarketCategory,
    setMarketSearch,
    setMarketSort,
    showToast,
  } = useStore();

  const [rarityFilter, setRarityFilter] = useState('all');

  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => {
      if (marketCategory !== 'all' && item.category !== marketCategory) return false;
      if (rarityFilter !== 'all' && item.rarity !== rarityFilter) return false;
      if (marketSearch && !item.name.toLowerCase().includes(marketSearch.toLowerCase())) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const rarityOrder = ['common', 'rare', 'epic', 'legendary'];
      switch (marketSort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'rarity':
        default:
          return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
      }
    });

    return filtered;
  }, [items, marketCategory, rarityFilter, marketSearch, marketSort]);

  const handleBuy = (itemId: string) => {
    const success = buyItem(itemId);
    if (success) {
      showToast('Sat\u0131n al\u0131nd\u0131!', 'success', '\u{1F389}');
    }
  };

  const handleEquipToggle = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    if (item.equipped) {
      unequipItem(itemId);
      showToast(`\u00c7\u0131kar\u0131ld\u0131: ${item.name}`, 'info', '\u{1F4A4}');
    } else {
      equipItem(itemId);
      showToast(`Giyildi: ${item.name}`, 'success', '\u2728');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Market</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            E\u015fyalar\u0131 ke\u015ffet ve koleksiyonunu b\u00fcy\u00fct
          </p>
        </div>
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
          }}
          whileHover={{ scale: 1.05 }}
        >
          <Coins className="w-4 h-4" style={{ color: '#ffd700' }} />
          <AnimatedCoins balance={user.balance} />
        </motion.div>
      </div>

      {/* Search & Sort row */}
      <div className="flex gap-3 items-start">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={marketSearch}
            onChange={(e) => setMarketSearch(e.target.value)}
            placeholder="E\u015fya ara..."
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 focus:outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={marketSort}
            onChange={(e) => setMarketSort(e.target.value)}
            className="appearance-none rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] pl-3 pr-8 py-2.5 text-sm text-[var(--text-primary)] focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 focus:outline-none cursor-pointer transition-colors"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Category + Rarity filters */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setMarketCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                marketCategory === cat.id
                  ? 'bg-[var(--active-bg)] text-[var(--text-primary)] border-[var(--border-color)] shadow-sm'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {RARITIES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRarityFilter(r.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                rarityFilter === r.id
                  ? 'bg-[var(--active-bg)] text-[var(--text-primary)] border-[var(--border-color)] shadow-sm'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item, i) => {
          const rarity = rarityConfig[item.rarity] ?? rarityConfig.common;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden transition-shadow duration-300"
                style={{
                  boxShadow: `0 1px 3px rgba(0,0,0,0.08)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 30px ${rarity.glowColor}, 0 0 0 1px ${rarity.color}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                }}
              >
                <div className="p-3">
                  {/* Emoji preview */}
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-3xl mb-3 transition-all duration-300"
                    style={{ backgroundColor: `${rarity.color}12` }}
                  >
                    <motion.span
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.emoji}
                    </motion.span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">
                    {item.name}
                  </h3>

                  {/* Rarity badge */}
                  <div className="mt-1.5 mb-3">
                    <Badge variant={rarity.badgeVariant} size="sm">
                      {item.rarity}
                    </Badge>
                  </div>

                  {/* Equipped badge */}
                  {item.owned && item.equipped && (
                    <div className="mb-2">
                      <Badge variant="success" size="sm">
                        <Check className="w-2.5 h-2.5 mr-0.5" /> Giyili
                      </Badge>
                    </div>
                  )}

                  {/* Action area */}
                  {item.owned ? (
                    <button
                      onClick={() => handleEquipToggle(item.id)}
                      className={cn(
                        'w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all border',
                        item.equipped
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
                      )}
                    >
                      {item.equipped ? (
                        <><Shirt className="w-3 h-3" /> \u00c7\u0131kar</>
                      ) : (
                        <><Shirt className="w-3 h-3" /> Giy</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all border bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                    >
                      <Coins className="w-3 h-3" style={{ color: '#ffd700' }} />
                      {item.price}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <ShoppingBag className="w-12 h-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-secondary)] font-medium">E\u015fya bulunamad\u0131</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Farkl\u0131 bir kategori veya arama deneyin
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
