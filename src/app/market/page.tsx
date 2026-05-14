'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Coins, ShoppingBag, Check, Shirt } from 'lucide-react';
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

const rarityConfig: Record<string, { label: string; color: string; badgeVariant: 'default' | 'info' | 'purple' | 'warning' }> = {
  common:    { label: 'Common',    color: '#94a3b8', badgeVariant: 'default' },
  rare:      { label: 'Rare',      color: '#22d3ee', badgeVariant: 'info' },
  epic:      { label: 'Epic',      color: '#8b5cf6', badgeVariant: 'purple' },
  legendary: { label: 'Legendary', color: '#ffd700', badgeVariant: 'warning' },
};

export default function MarketPage() {
  const {
    user,
    items,
    buyItem,
    equipItem,
    unequipItem,
    marketCategory,
    marketSearch,
    setMarketCategory,
    setMarketSearch,
  } = useStore();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (marketCategory !== 'all' && item.category !== marketCategory) return false;
      if (marketSearch && !item.name.toLowerCase().includes(marketSearch.toLowerCase())) return false;
      return true;
    });
  }, [items, marketCategory, marketSearch]);

  const handleBuy = (itemId: string) => {
    buyItem(itemId);
  };

  const handleEquipToggle = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    if (item.equipped) {
      unequipItem(itemId);
    } else {
      equipItem(itemId);
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
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
          }}
        >
          <Coins className="w-4 h-4" style={{ color: '#ffd700' }} />
          <span className="font-bold text-sm" style={{ color: '#b8860b' }}>
            {user.balance}
          </span>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={marketSearch}
            onChange={(e) => setMarketSearch(e.target.value)}
            placeholder="E\u015fya ara..."
            className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 focus:outline-none transition-colors"
          />
        </div>
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
              <Card
                padding="sm"
                className="group"
                hover
              >
                {/* Emoji preview */}
                <div
                  className="w-full aspect-square rounded-xl flex items-center justify-center text-3xl mb-3 transition-colors"
                  style={{ backgroundColor: `${rarity.color}12` }}
                >
                  {item.emoji}
                </div>

                {/* Name + category */}
                <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">
                  {item.name}
                </h3>

                {/* Rarity badge */}
                <div className="mt-1.5 mb-3">
                  <Badge variant={rarity.badgeVariant} size="sm">
                    {item.rarity}
                  </Badge>
                </div>

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
                      <>
                        <Check className="w-3 h-3" /> Giyili
                      </>
                    ) : (
                      <>
                        <Shirt className="w-3 h-3" /> Giy
                      </>
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
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-secondary)] font-medium">E\u015fya bulunamad\u0131</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Farkl\u0131 bir kategori veya arama deneyin
          </p>
        </div>
      )}
    </motion.div>
  );
}
