export type UpgradeId = 'warmIntro' | 'pitchDeckV2' | 'advisorCc' | 'dataRoom' | 'boardMeeting';
export type RejectionFlavor = 'soft pass' | 'warm intro' | 'deck review' | 'diligence note' | 'final round' | 'legal review';
export type RejectionSource = 'click' | 'passive' | 'upgrade' | 'system';

export interface RejectionEvent {
  id: string;
  title: string;
  body: string;
  source: RejectionSource;
  flavor: RejectionFlavor;
  amount: number;
}

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  baseCost: number;
  growth: number;
  clickBonus: number;
  passiveBonus: number;
  unlocks: RejectionFlavor[];
}

export const UPGRADE_DEFS: UpgradeDefinition[] = [
  {
    id: 'warmIntro',
    name: 'Warm intro',
    description: 'Adds instant credibility and nudges the rejection engine faster.',
    baseCost: 15,
    growth: 1.38,
    clickBonus: 1,
    passiveBonus: 0.2,
    unlocks: ['warm intro'],
  },
  {
    id: 'pitchDeckV2',
    name: 'Pitch deck v2',
    description: 'Sharper narrative, fewer slides, more polite passes.',
    baseCost: 60,
    growth: 1.5,
    clickBonus: 2,
    passiveBonus: 0.8,
    unlocks: ['deck review'],
  },
  {
    id: 'advisorCc',
    name: 'Advisor cc',
    description: 'Pulls more people into the thread and accelerates the no.',
    baseCost: 180,
    growth: 1.62,
    clickBonus: 1,
    passiveBonus: 1.9,
    unlocks: ['diligence note'],
  },
  {
    id: 'dataRoom',
    name: 'Data room polish',
    description: 'The cleaner the room, the colder the decline.',
    baseCost: 520,
    growth: 1.72,
    clickBonus: 2,
    passiveBonus: 3.2,
    unlocks: ['legal review'],
  },
  {
    id: 'boardMeeting',
    name: 'Board meeting',
    description: 'Unlocks the final round pass and a steadier stream of rejection.',
    baseCost: 1400,
    growth: 1.85,
    clickBonus: 3,
    passiveBonus: 4.5,
    unlocks: ['final round'],
  },
];

const EVENT_LIBRARY: Record<RejectionFlavor, { title: string; bodies: string[] }> = {
  'soft pass': {
    title: 'Soft pass',
    bodies: [
      'Thanks for sharing the materials. We are going to pass for now.',
      'Appreciate the update. This is not a fit for our current focus.',
      'Thanks again. We are going to sit this one out.',
    ],
  },
  'warm intro': {
    title: 'Warm intro decline',
    bodies: [
      'The intro helped, but we still do not see enough pull to move forward.',
      'We appreciate the context. The timing still does not work for us.',
      'The relationship is helpful, but the opportunity is still not a fit.',
    ],
  },
  'deck review': {
    title: 'Deck review pass',
    bodies: [
      'The deck is cleaner now, but we still are not compelled to lean in.',
      'We reviewed the updated deck and will pass at this stage.',
      'The narrative is sharper, yet the answer remains no.',
    ],
  },
  'diligence note': {
    title: 'Diligence note',
    bodies: [
      'After diligence, we think the risk profile is still too high for us.',
      'The more we dug in, the more reasons we found to stay on the sidelines.',
      'We appreciate the transparency, but we cannot commit here.',
    ],
  },
  'final round': {
    title: 'Final round pass',
    bodies: [
      'This made it far, but we do not have conviction to move ahead.',
      'The team is strong, yet we are going to let this one go.',
      'We reached the final stretch and still do not think it is our next bet.',
    ],
  },
  'legal review': {
    title: 'Legal review flag',
    bodies: [
      'Legal review raised a few issues we are not comfortable underwriting.',
      'There are still too many unresolved terms for us to proceed.',
      'We cannot move forward until the document set is materially simpler.',
    ],
  },
};

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function choose<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

export function getUpgradeCost(definition: UpgradeDefinition, level: number) {
  return Math.max(1, Math.floor(definition.baseCost * Math.pow(definition.growth, level)));
}

export function getUnlockedFlavors(levels: Record<UpgradeId, number>) {
  const flavors: RejectionFlavor[] = ['soft pass'];

  for (const upgrade of UPGRADE_DEFS) {
    if (levels[upgrade.id] > 0) {
      for (const flavor of upgrade.unlocks) {
        if (!flavors.includes(flavor)) {
          flavors.push(flavor);
        }
      }
    }
  }

  return flavors;
}

export function buildRejectionEvent(options: {
  idSeed: number;
  source: RejectionSource;
  amount: number;
  flavor: RejectionFlavor;
  total: number;
  title?: string;
}): RejectionEvent {
  const rng = createRng(options.idSeed + options.amount + options.total);
  const entry = EVENT_LIBRARY[options.flavor] ?? EVENT_LIBRARY['soft pass'];
  return {
    id: `${options.source}-${options.idSeed}-${options.total}-${options.amount}`,
    title: options.title ?? entry.title,
    body: choose(entry.bodies, rng),
    source: options.source,
    flavor: options.flavor,
    amount: options.amount,
  };
}

export function buildRejectionStream(options: {
  count: number;
  source: RejectionSource;
  flavors: RejectionFlavor[];
  total: number;
}) {
  const rng = createRng(options.total + options.count * 13 + options.flavors.length * 97);
  const stream: RejectionEvent[] = [];

  for (let index = 0; index < options.count; index += 1) {
    const flavor = choose(options.flavors, rng);
    stream.push(
      buildRejectionEvent({
        idSeed: options.total + index + 1,
        source: options.source,
        amount: 1,
        flavor,
        total: options.total + index + 1,
      }),
    );
  }

  return stream;
}
