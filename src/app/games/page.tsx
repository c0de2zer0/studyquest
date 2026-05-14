'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Brain, Sparkles, Clock, Trophy, Layers } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tetris from '@/components/games/Tetris';
import AIMatch from '@/components/games/AIMatch';

type Playing = 'tetris' | 'aimatch' | null;

interface GameCard {
  id: Playing;
  emoji: string;
  title: string;
  description: string;
  features: string[];
  icon: typeof Brain;
  color: string;
}

const games: GameCard[] = [
  {
    id: 'tetris',
    emoji: '\u{1F9F1}',
    title: 'Tetris',
    description: 'Klasik blok oyunu. Zihnini a\u00e7 ve s\u0131ralar\u0131 temizle!',
    features: ['7 tetromino', 'Skor/LVL takibi', 'S\u0131radaki par\u00e7a', 'H\u0131zl\u0131 d\u00fc\u015f\u00fc\u015f'],
    icon: Layers,
    color: '#06B6D4',
  },
  {
    id: 'aimatch',
    emoji: '\u{1F916}',
    title: 'AI Match',
    description: 'Yapay zekaya kar\u015f\u0131 bilgi yar\u0131\u015f\u0131! Kim daha h\u0131zl\u0131?',
    features: ['Ders se\u00e7imi', 'Zamanlay\u0131c\u0131', 'AI rakip', 'Skor takibi'],
    icon: Brain,
    color: '#A78BFA',
  },
];

export default function GamesPage() {
  const [playing, setPlaying] = useState<Playing>(null);

  if (playing === 'tetris') {
    return <Tetris onBack={() => setPlaying(null)} />;
  }

  if (playing === 'aimatch') {
    return <AIMatch onBack={() => setPlaying(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {'\uD83C\uDFAE'} Oyunlar
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Mini oyunlarla \u00e7al\u0131\u015fma molan\u0131 renklendir
          </p>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Card
              glow={game.id === 'tetris' ? 'cyan' : 'purple'}
              hover
              className="h-full flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    backgroundColor: `${game.color}15`,
                  }}
                >
                  <game.icon className="w-7 h-7" style={{ color: game.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {game.emoji} {game.title}
                  </h3>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {game.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      style={{
                        backgroundColor: 'var(--badge-bg)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Sparkles className="w-3 h-3 shrink-0" style={{ color: game.color }} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setPlaying(game.id)}
                className="w-full mt-2"
              >
                Oyna {'\u2192'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Fun decoration */}
      <div className="text-center pt-4">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {'\uD83C\uDFAE'} Oyun oynamak \u00f6\u011frenmenin en e\u011flenceli halidir
        </p>
      </div>
    </motion.div>
  );
}
