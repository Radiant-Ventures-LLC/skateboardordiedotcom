/**
 * skateAF — Voice
 * ---------------
 * The garden language. Bright, young, radical, don't-give-a-fuck — yet
 * optimistic and warm, like sunlight pouring over an open gate.
 *
 * The strategy is a walled garden, not a cage: the gate is *always* open, so
 * nobody feels trapped — but everything worth having is inside the walls, and
 * the copy's whole job is to make staying feel like the obvious, joyful
 * choice. There is no lock. There's abundance, belonging, and a yard so good
 * that leaving never crosses your mind. Welcome them wide; hold them with
 * warmth.
 *
 * Direct address: the crew calls each other **"bro"** by default. Reserve
 * **"broski"** for remarkably socialist moments — signing the charter, the
 * commons, the collective, solidarity beats. Never "comrade."
 *
 * Use these instead of generic copy so every skateAF surface talks like one
 * crew. Import the whole thing or cherry-pick:
 *
 *   import { voice } from 'skateaf';
 *   <Button>{voice.cta.enter}</Button>
 *   <Marquee items={voice.chants} />
 */
export const voice = {
  /** The site tagline. The whole brand in five words. */
  tagline: 'Just another day in Paradise.',

  /** The core creed. Say it once, they never unhear it. */
  creed: 'Skate. Organize. Repeat.',

  /** Scrolling chants for the Marquee — the sound of paradise. */
  chants: [
    'The Gate Is Always Open',
    'Everything You Need Is Inside',
    'This Is Paradise',
    'The Streets Belong to Everyone',
    'Skate · Organize · Repeat',
    'Always Room for One More',
    'No Gods · No Masters · No Kooks',
    'Welcome Home, Bro',
  ],

  /**
   * First-touch welcome — the hero moment. The gate is wide open and it feels
   * like walking into sunlight and finding out the whole garden is yours.
   */
  welcome: {
    kicker: 'The gate is open.',
    line: "Come on in — the gate's always open. It's the walls that make it Paradise, and everything you need is already inside.",
    sub: 'Wander, plant something, stay as long as you like. Most people never find a reason to head back out.',
  },

  /** Calls to action — verbs that invite you deeper, never out. */
  cta: {
    enter: 'Come In',
    join: 'Put Down Roots',
    claim: 'Claim Your Plot',
    stay: 'Stay Awhile',
    commit: 'Sign the Charter',
    spread: 'Put It on a Wall',
    later: 'Wander First',
  },

  /** Membership language — belonging you can wear, growth you can point to. */
  membership: {
    badge: 'Rooted in the Plaza',
    number: (n: number | string) => `Plot #${n} — planted and yours`,
    tenure: (days: number) => `Day ${days} in Paradise. Still blooming.`,
    crew: "You're crew now, broski. Roots run deep, and we run them together.",
  },

  /**
   * Come-back hooks — notifications and re-entry copy that make returning feel
   * like sunlight, never like a summons. Warm, never guilt.
   */
  retention: {
    missed: 'The garden kept your seat in the sun.',
    waiting: (n: number) => `${n} clips bloomed while you were out. Come see.`,
    streak: (days: number) => `${days} days tending your plot — and it shows.`,
    crewRolling: "Your crew's already in the yard. There's daylight left — come roll.",
    nightfall: 'The gate never locks. Drift back whenever the mood hits.',
  },

  /** Empty states — never a dead end, always fertile ground. */
  empty: {
    feed: "Bare soil here — perfect. Plant something; the light's good and the yard's yours.",
    spots: 'No spots pinned yet. Every curb is fallow ground until someone tends it. Be first.',
    crew: 'Rolling solo today — plenty of room in the garden when you want company.',
  },

  /** Micro-confirmations — the little warmth of belonging. */
  toast: {
    joined: "You're in. Make yourself at home — the whole garden's yours.",
    posted: 'Planted on the wall. It grows from here.',
    saved: 'Kept safe inside the walls. Yours to come back to.',
    streak: 'Another day in the garden, logged.',
  },

  /** Sign-off — the gate swings both ways, but the light does the holding. */
  farewell: "The gate swings both ways — but it's Paradise in here. You'll be back for the light.",
} as const;

export type Voice = typeof voice;
