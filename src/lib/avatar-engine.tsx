'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AVATAR_LAYER_MAP,
  BASE_BODY_LAYER,
  BASE_HEAD_LAYER,
  WARRIOR_BODY_LAYER,
  WARRIOR_HEAD_LAYER,
  FEMALE_BASE_BODY_LAYER,
  FEMALE_BASE_HEAD_LAYER,
  FEMALE_WARRIOR_BODY_LAYER,
  FEMALE_WARRIOR_HEAD_LAYER,
  BACKGROUND_PALETTES,
  generateEyes,
  generateMouth,
  generateCheeks,
  generateHair,
  SKIN_COLORS,
  HAIR_COLORS,
  AURA_COLORS,
  type AvatarLayerDef,
  type AnimatedLayerDef,
  type PixelRect,
  type EyeStyle,
  type MouthStyle,
  type HairStyle,
  type StyleMode,
  type Gender,
} from './avatar-layers';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AvatarOptions {
  skinColor: string;
  eyeStyle: EyeStyle;
  mouthStyle: MouthStyle;
  hairStyle: HairStyle;
  hairColor: string;
  auraColor: string | null;
  styleMode: StyleMode;
  gender: Gender;
  weapon?: string | null;
}

export const DEFAULT_AVATAR_OPTIONS: AvatarOptions = {
  skinColor: SKIN_COLORS.light,
  eyeStyle: 'big',
  mouthStyle: 'smile',
  hairStyle: 'short',
  hairColor: HAIR_COLORS.black,
  auraColor: null,
  styleMode: 'cute',
  gender: 'male',
  weapon: null,
};

export interface AvatarEngineOptions {
  size?: number;
  animate?: boolean;
  hover3d?: boolean;
  showBackground?: boolean;
  avatarOptions?: AvatarOptions;
}

interface EquippedItems {
  hat: string | null;
  top: string | null;
  bottom: string | null;
  shoes: string | null;
  hair: string | null;
  accessory: string | null;
  background?: string | null;
  weapon?: string | null;
}

// ─── Style-Appropriate Default Clothing ─────────────────────────────────────

const CUTE_DEFAULT_TOP: PixelRect[] = [
  { x: 4, y: 12, w: 8, h: 8, color: '#FF69B4' },
  { x: 2, y: 12, w: 3, h: 6, color: '#FF69B4' },
  { x: 11, y: 12, w: 3, h: 6, color: '#FF69B4' },
  { x: 5, y: 14, w: 6, h: 3, color: '#FFFFFF' },
  { x: 6, y: 15, w: 4, h: 1, color: '#FF69B480' },
  { x: 5, y: 12, w: 6, h: 1, color: '#FFB5D5' },
  { x: 2, y: 17, w: 3, h: 1, color: '#FFB5D5' },
  { x: 11, y: 17, w: 3, h: 1, color: '#FFB5D5' },
];

const CUTE_DEFAULT_BOTTOM: PixelRect[] = [
  { x: 4, y: 21, w: 8, h: 2, color: '#FF69B4' },
  { x: 4, y: 23, w: 4, h: 5, color: '#F5C09A' },
  { x: 8, y: 23, w: 4, h: 5, color: '#F5C09A' },
  { x: 4, y: 23, w: 8, h: 1, color: '#FFB5D5' },
  { x: 6, y: 21, w: 4, h: 2, color: '#FFB5D5' },
];

const CUTE_DEFAULT_SHOES: PixelRect[] = [
  { x: 4, y: 29, w: 4, h: 3, color: '#FF69B4' },
  { x: 8, y: 29, w: 4, h: 3, color: '#FF69B4' },
  { x: 3, y: 30, w: 5, h: 2, color: '#FFB5D5' },
  { x: 8, y: 30, w: 5, h: 2, color: '#FFB5D5' },
  { x: 4, y: 29, w: 4, h: 1, color: '#FFFFFF' },
  { x: 8, y: 29, w: 4, h: 1, color: '#FFFFFF' },
];

const WARRIOR_DEFAULT_TOP: PixelRect[] = [
  { x: 4, y: 11, w: 8, h: 9, color: '#64748B' },
  { x: 2, y: 11, w: 3, h: 7, color: '#64748B' },
  { x: 11, y: 11, w: 3, h: 7, color: '#64748B' },
  { x: 4, y: 11, w: 8, h: 2, color: '#94A3B8' },
  { x: 2, y: 11, w: 3, h: 2, color: '#94A3B8' },
  { x: 11, y: 11, w: 3, h: 2, color: '#94A3B8' },
  { x: 5, y: 14, w: 6, h: 1, color: '#475569' },
  { x: 6, y: 16, w: 4, h: 1, color: '#475569' },
  { x: 4, y: 11, w: 1, h: 9, color: '#475569' },
  { x: 11, y: 11, w: 1, h: 9, color: '#475569' },
];

const WARRIOR_DEFAULT_BOTTOM: PixelRect[] = [
  { x: 4, y: 20, w: 8, h: 9, color: '#64748B' },
  { x: 5, y: 21, w: 3, h: 7, color: '#94A3B8' },
  { x: 8, y: 21, w: 3, h: 7, color: '#94A3B8' },
  { x: 4, y: 20, w: 8, h: 1, color: '#475569' },
  { x: 4, y: 20, w: 1, h: 9, color: '#475569' },
  { x: 11, y: 20, w: 1, h: 9, color: '#475569' },
  { x: 5, y: 27, w: 3, h: 2, color: '#475569' },
  { x: 8, y: 27, w: 3, h: 2, color: '#475569' },
];

const WARRIOR_DEFAULT_SHOES: PixelRect[] = [
  { x: 4, y: 28, w: 4, h: 4, color: '#64748B' },
  { x: 8, y: 28, w: 4, h: 4, color: '#64748B' },
  { x: 4, y: 28, w: 4, h: 1, color: '#94A3B8' },
  { x: 8, y: 28, w: 4, h: 1, color: '#94A3B8' },
  { x: 3, y: 30, w: 5, h: 2, color: '#475569' },
  { x: 8, y: 30, w: 5, h: 2, color: '#475569' },
];

// ─── Skin Color Adaptation ──────────────────────────────────────────────────

const SKIN_LIKE_COLORS = ['#E8B48A', '#D4956A', '#C07050', '#A06040', '#F5C09A', '#F5C89A', '#FFDAB9', '#F0E6D3'];

function adaptSkinPixels(def: AvatarLayerDef, skinColor: string): AvatarLayerDef {
  return {
    ...def,
    pixels: def.pixels.map(p => ({
      ...p,
      color: SKIN_LIKE_COLORS.includes(p.color) ? skinColor : p.color,
    })),
  };
}

// ─── Pixel Rect Renderer ────────────────────────────────────────────────────

function renderPixels(pixels: PixelRect[], scale: number, className = ''): React.ReactNode {
  return pixels.map((rect, i) => (
    <rect
      key={`px-${className}-${i}`}
      x={rect.x * scale}
      y={rect.y * scale}
      width={rect.w * scale}
      height={rect.h * scale}
      fill={rect.color}
      rx={scale * 0.5}
      className={className}
    />
  ));
}

// ─── Main Renderer ──────────────────────────────────────────────────────────

export function renderAvatar(
  equippedItems: EquippedItems,
  items: Array<{ id: string; name: string; category: string }>,
  options: AvatarEngineOptions = {},
): React.ReactElement {
  const {
    size = 300,
    animate = true,
    hover3d = false,
    showBackground = true,
    avatarOptions = DEFAULT_AVATAR_OPTIONS,
  } = options;

  const { skinColor, eyeStyle, mouthStyle, hairStyle, hairColor, auraColor, styleMode, gender } = avatarOptions;
  const scale = size / 16;
  const viewBox = '0 0 16 32';
  const isWarrior = styleMode === 'warrior';
  const isFemale = gender === 'female';

  // Look up pixel layers for equipped items
  const hatLayer = equippedItems.hat ? AVATAR_LAYER_MAP[equippedItems.hat] : null;
  const hairItemLayer = equippedItems.hair ? AVATAR_LAYER_MAP[equippedItems.hair] : null;
  const topLayer = equippedItems.top ? AVATAR_LAYER_MAP[equippedItems.top] : null;
  const bottomLayer = equippedItems.bottom ? AVATAR_LAYER_MAP[equippedItems.bottom] : null;
  const shoesLayer = equippedItems.shoes ? AVATAR_LAYER_MAP[equippedItems.shoes] : null;
  const accessoryLayer = equippedItems.accessory ? AVATAR_LAYER_MAP[equippedItems.accessory] : null;
  const bgLayer = equippedItems.background ? BACKGROUND_PALETTES[equippedItems.background] : null;
  // Weapon from avatarOptions (style-based) or equippedItems (inventory-based)
  const weaponId = equippedItems.weapon || avatarOptions.weapon || null;
  const weaponLayer = (isWarrior && weaponId) ? AVATAR_LAYER_MAP[weaponId] : null;

  // Face generation
  const eyes = generateEyes(eyeStyle, skinColor);
  const mouth = generateMouth(mouthStyle);
  const cheeks = generateCheeks();
  const baseHair = hairItemLayer ? null : generateHair(hairStyle, hairColor);

  // Base body/head layer selection (gender + style mode)
  const baseBodyDef = isWarrior
    ? (isFemale ? FEMALE_WARRIOR_BODY_LAYER : WARRIOR_BODY_LAYER)
    : (isFemale ? FEMALE_BASE_BODY_LAYER : BASE_BODY_LAYER);
  const baseHeadDef = isWarrior
    ? (isFemale ? FEMALE_WARRIOR_HEAD_LAYER : WARRIOR_HEAD_LAYER)
    : (isFemale ? FEMALE_BASE_HEAD_LAYER : BASE_HEAD_LAYER);
  const bodySkin = adaptSkinPixels(baseBodyDef, skinColor);
  const headSkin = adaptSkinPixels(baseHeadDef, skinColor);

  // Aura gradient ID
  const auraId = 'avatar-aura-glow';

  const svgContent = (
    <svg
      viewBox={viewBox}
      width={size}
      height={size * 2}
      style={{ imageRendering: 'pixelated' }}
    >
      <defs>
        {/* Aura glow radial gradient */}
        {(auraColor || (showBackground && bgLayer)) && (
          <radialGradient id={auraId} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={auraColor || 'transparent'} stopOpacity={0.3} />
            <stop offset="60%" stopColor={auraColor || 'transparent'} stopOpacity={0.1} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>
        )}
        {showBackground && bgLayer && (
          <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bgLayer[0]} />
            <stop offset="50%" stopColor={bgLayer[1]} />
            <stop offset="100%" stopColor={bgLayer[2]} />
          </linearGradient>
        )}
      </defs>

      {/* Background */}
      <rect
        x="0" y="0" width="16" height="32"
        fill={showBackground && bgLayer ? 'url(#bg-grad)' : '#141428'}
        rx={scale * 0.5}
      />

      {/* Aura Glow */}
      {auraColor && (
        <rect
          x="0" y="0" width="16" height="32"
          fill={`url(#${auraId})`}
        />
      )}

      {/* Body parts - proportions differ by style mode */}
      {isWarrior ? (
        <>
          {/* Warrior: Torso + Arms with default armor if none equipped */}
          {renderPixels(topLayer ? topLayer.pixels : WARRIOR_DEFAULT_TOP, 1, 'avatar-top')}
          {/* Warrior: Arms armor */}
          {!topLayer && renderPixels(WARRIOR_DEFAULT_TOP.filter(p => p.x < 4), 1, 'avatar-top')}
          {!topLayer && renderPixels(WARRIOR_DEFAULT_TOP.filter(p => p.x >= 11), 1, 'avatar-top')}
          {/* Warrior: Bottom layer (legs) with default greaves */}
          {renderPixels(bottomLayer ? bottomLayer.pixels : WARRIOR_DEFAULT_BOTTOM, 1, 'avatar-bottom')}
          {/* Warrior: Shoes with default boots */}
          {renderPixels(shoesLayer ? shoesLayer.pixels : WARRIOR_DEFAULT_SHOES, 1, 'avatar-shoes')}
          {/* Warrior: Neck */}
          {renderPixels(bodySkin.pixels.filter(p => p.y === 10), 1, 'avatar-body')}
        </>
      ) : (
        <>
          {/* Cute: Torso + Arms with default pink clothes if none equipped */}
          {renderPixels(topLayer ? topLayer.pixels : CUTE_DEFAULT_TOP, 1, 'avatar-top')}
          {/* Cute: Bottom layer with default skirt */}
          {renderPixels(bottomLayer ? bottomLayer.pixels : CUTE_DEFAULT_BOTTOM, 1, 'avatar-bottom')}
          {/* Cute: Shoes with default pink sneakers */}
          {renderPixels(shoesLayer ? shoesLayer.pixels : CUTE_DEFAULT_SHOES, 1, 'avatar-shoes')}
          {/* Cute: Neck */}
          {renderPixels(bodySkin.pixels.filter(p => p.y === 11), 1, 'avatar-body')}
        </>
      )}

      {/* Head */}
      {renderPixels(headSkin.pixels, 1, 'avatar-head')}

      {/* Cheeks (rosy, cute) */}
      {renderPixels(cheeks, 1, 'avatar-cheeks')}

      {/* Eyes */}
      {renderPixels(eyes, 1, 'avatar-eyes')}

      {/* Female eyelashes */}
      {isFemale && renderPixels([
        { x: 4, y: 2, w: 3, h: 1, color: '#1A1A2E' },
        { x: 9, y: 2, w: 3, h: 1, color: '#1A1A2E' },
        { x: 3, y: 3, w: 1, h: 1, color: '#1A1A2E' },
        { x: 12, y: 3, w: 1, h: 1, color: '#1A1A2E' },
      ], 1, 'avatar-lashes')}

      {/* Mouth */}
      {renderPixels(mouth, 1, 'avatar-mouth')}

      {/* Base Hair (if no hair item equipped) */}
      {baseHair && renderPixels(baseHair, 1, 'avatar-hair')}

      {/* Hair item (if equipped - overrides base hair) */}
      {hairItemLayer && renderPixels(hairItemLayer.pixels, 1, 'avatar-hair')}

      {/* Hat */}
      {hatLayer && renderPixels(hatLayer.pixels, 1, 'avatar-hat')}

      {/* Accessory */}
      {accessoryLayer && renderPixels(accessoryLayer.pixels, 1, 'avatar-acc')}

      {/* Cute mode: extra blush emphasis */}
      {!isWarrior && renderPixels([
        { x: 3, y: 6, w: 2, h: 2, color: '#FF8FA080' },
        { x: 11, y: 6, w: 2, h: 2, color: '#FF8FA080' },
      ], 1, 'avatar-blush')}

      {/* Weapon (warrior mode only) */}
      {weaponLayer && renderPixels(weaponLayer.pixels, 1, 'avatar-weapon')}
    </svg>
  );

  // Wrap with animations if requested
  if (animate && hover3d) {
    return (
      <div className="relative group perspective-[800px]">
        <motion.div
          whileHover={{ rotateY: 6, rotateX: -6 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {svgContent}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (animate) {
    return (
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {svgContent}
      </motion.div>
    );
  }

  return svgContent as unknown as React.ReactElement;
}

// ─── Mini Preview (for market / inventory) ──────────────────────────────────

export function ItemPixelPreview({
  itemId,
  size = 48,
}: {
  itemId: string;
  size?: number;
}): React.ReactElement | null {
  const layer = AVATAR_LAYER_MAP[itemId];
  if (!layer) return null;

  const scale = size / 16;
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
    >
      {renderPixels(layer.pixels, 1)}
    </svg>
  ) as unknown as React.ReactElement;
}

// ─── Avatar Preview on Item Hover (for market) ──────────────────────────────

export function AvatarWithItemPreview({
  equippedItems,
  previewItemId,
  items,
  size = 200,
  avatarOptions,
}: {
  equippedItems: EquippedItems;
  previewItemId: string;
  items: Array<{ id: string; name: string; category: string }>;
  size?: number;
  avatarOptions?: AvatarOptions;
}): React.ReactElement {
  const layer = AVATAR_LAYER_MAP[previewItemId];
  if (!layer) {
    return renderAvatar(equippedItems, items, { size, animate: false, avatarOptions });
  }

  const previewEquipped = { ...equippedItems };
  previewEquipped[layer.slot as keyof EquippedItems] = previewItemId;

  return renderAvatar(previewEquipped, items, { size, animate: false, avatarOptions });
}
