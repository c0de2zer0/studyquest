'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Swords, Trophy } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn, formatNumber } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

type FeedTab = 'explore' | 'challenges' | 'battles' | 'channels';

export default function CommunityPage() {
  const { communityPosts, addPostReaction, joinChallenge } = useStore();
  const [tab, setTab] = useState<FeedTab>('explore');

  const tabs: { id: FeedTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'explore', label: 'Ke\u015ffet', icon: MessageSquare },
    { id: 'challenges', label: 'Meydan Okuma', icon: Swords },
    { id: 'battles', label: 'Sava\u015flar', icon: Trophy },
    { id: 'channels', label: 'Kanallar', icon: Users },
  ];

  const filtered = communityPosts.filter((p) => {
    if (tab === 'explore') return true;
    if (tab === 'challenges') return p.type === 'challenge';
    if (tab === 'battles') return p.type === 'battle';
    if (tab === 'channels') return p.type === 'channel_post';
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Topluluk</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Di\u011fer \u00f6\u011frencilerle ba\u011flan
          </p>
        </div>
      </div>

      {/* Feed Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
              tab === t.id
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filtered.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* Channel Post (Do\u011frulanm\u0131\u015f kanal) */}
            {post.type === 'channel_post' && post.isVerifiedChannel && (
              <Card glow="gold">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{post.channelEmoji}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {post.channelName}
                      </h3>
                      <Badge variant="warning" size="sm">
                        Do\u011frulanm\u0131\u015f
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatNumber(post.followerCount || 0)} takip\u00e7i
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{post.content}</p>
                {post.tournamentName && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                      {post.tournamentName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {post.tournamentPrize} &middot; {post.tournamentParticipants}/
                      {post.tournamentCapacity} kat\u0131l\u0131mc\u0131
                    </p>
                  </div>
                )}

                {/* Reaction bar */}
                {post.reactions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {post.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => addPostReaction(post.id, r.emoji)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all border',
                          r.reacted
                            ? 'bg-[var(--active-bg)] border-[var(--border-color)] text-[var(--text-primary)]'
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-color)]'
                        )}
                      >
                        {r.emoji} {r.count}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Battle Post */}
            {post.type === 'battle' && post.player1 && post.player2 && (
              <Card glow="purple">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="info">Canl\u0131 Sava\u015f</Badge>
                  <span className="text-xs text-[var(--text-muted)]">{post.battleSubject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-1">{post.player1.emoji}</div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {post.player1.name}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: '#22d3ee' }}>
                      {post.player1.score}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-[var(--text-muted)] px-4">VS</div>
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-1">{post.player2.emoji}</div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {post.player2.name}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                      {post.player2.score}
                    </p>
                  </div>
                </div>
                {post.timeRemainingSeconds && (
                  <p className="text-center text-xs text-[var(--text-muted)] mt-3">
                    {Math.floor(post.timeRemainingSeconds / 60)}:
                    {(post.timeRemainingSeconds % 60).toString().padStart(2, '0')} kald\u0131
                  </p>
                )}
              </Card>
            )}

            {/* Regular Post & Challenge */}
            {(post.type === 'post' || post.type === 'challenge') && (
              <Card hover>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${post.userColor}18` }}
                  >
                    {post.userEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {post.userName}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{post.timestamp}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{post.content}</p>

                    {/* Challenge metadata */}
                    {post.type === 'challenge' && post.subject && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <Badge variant="info" size="sm">{post.subject}</Badge>
                        <Badge variant="default" size="sm">{post.durationMin}dk</Badge>
                        {post.participants && (
                          <Badge variant="success" size="sm">
                            {post.participants.length} kat\u0131l\u0131mc\u0131
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Reactions */}
                    {post.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.reactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => addPostReaction(post.id, r.emoji)}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all border',
                              r.reacted
                                ? 'bg-[var(--active-bg)] border-[var(--border-color)] text-[var(--text-primary)]'
                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-color)]'
                            )}
                          >
                            {r.emoji} {r.count}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Join challenge button */}
                    {post.type === 'challenge' && (
                      <div className="mt-3">
                        <button
                          onClick={() => joinChallenge(post.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition-all"
                        >
                          Kat\u0131l
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-secondary)] font-medium">G\u00f6nderi bulunamad\u0131</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Bu sekmede hen\u00fcz i\u00e7erik yok</p>
        </div>
      )}
    </motion.div>
  );
}
