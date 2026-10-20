/**
 * The content module: every word of copy on the landing page, in one typed place.
 *
 * Components read from here and carry no copy of their own. The copy is transcribed
 * verbatim from the original site — see `docs/agents/reference-notes.md` for the
 * transcription it came from.
 */

/**
 * A destination.
 *
 * `external` means the destination leaves the clone: it is a page of the
 * original site, or another site altogether. The components that render a
 * destination open the external ones in a new tab, with the safe `rel`.
 */
export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

/**
 * The original site's origin.
 *
 * The clone is one route — the landing page — so every destination that is not
 * the landing page itself is a page of the original site, named by its path
 * there.
 */
const ORIGINAL_SITE = "https://getartcraft.com";

/** A page of the original site: an absolute destination that leaves the clone. */
function originalPage(path: string): string {
  return `${ORIGINAL_SITE}${path}`;
}

/** A named group of destinations — a dropdown panel, or a footer column. */
export type NavGroup = {
  label: string;
  links: NavLink[];
};

/** A heading whose middle phrase is set as the Serif Accent. */
export type Headline = {
  before: string;
  accent: string;
  after: string;
  /** The hero's accent runs in the muted ink; the section accents do not. */
  accentMuted?: boolean;
};

/**
 * A heading's tail: the part that follows the Serif Accent.
 *
 * The tail is joined the way it reads: a space between words, but no space
 * before punctuation — "Start crafting." is not "Start crafting .".
 */
export function headlineTail({ after }: { after: string }): string {
  if (!after) {
    return ""
  }

  return /^[\p{P}]/u.test(after) ? after : ` ${after}`
}

/**
 * A heading's parts, as plain text.
 */
export function headlineText({
  before,
  accent,
  after,
}: Headline): string {
  return `${before} ${accent}${headlineTail({ after })}`
}

/** The numbered strip that opens a section. */
export type SectionBar = {
  number: string;
  subject: string;
  descriptor: string;
};

/** A call to action. */
export type Action = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  external?: boolean;
};

export type FeatureEntry =
  | {
      kind: "video";
      category: string;
      index: string;
      title: string;
      body: string;
      video: { src: string; label: string };
    }
  | {
      kind: "link";
      category: string;
      index: string;
      title: string;
      body: string;
      action: { label: string; href: string; external?: boolean };
    };

export type OwnershipEntry = {
  letter: string;
  title: string;
  body: string;
  action?: { label: string; href: string; external?: boolean };
};

export type FilmEntry = {
  label: string;
  index: string;
  title: string;
  poster: string;
  href: string;
  external?: boolean;
};

/** The site itself: who made it and how to reach them. */
export const site = {
  title: "ArtCraft — Controllable AI for Artists",
  description:
    "ArtCraft is the open-source desktop app for generating AI video and images — built for artists who want real control.",
  email: "hello@storyteller.ai",
  tagline: "The open-source studio for controllable AI image and video.",
  logo: "/artcraft-icon.svg",
  /** The logo's accessible name — the original's `alt` on the vendored mark. */
  logoAlt: "ArtCraft",
  repository: "https://github.com/storytold/artcraft",
  app: "https://app.getartcraft.com/",
  discord: "https://discord.gg/artcraft",
} as const;

/**
 * The skip link: the first thing a keyboard reaches, and the way past the
 * header to the content.
 *
 * It is hidden until it takes focus, and it says what it does.
 */
export const skipLink = {
  /** The link's own text. */
  label: "Skip to content",
  /** The id of the element it jumps to — the main content. */
  target: "main",
} as const;

/** The theme toggle's accessible names, named for the theme each one switches to. */
export const themeToggle = {
  toLight: "Switch to light theme",
  toDark: "Switch to dark theme",
} as const;

/**
 * The Drawer's accessible names.
 *
 * The menu button carries the original's name; the drawer names itself, and
 * its close button says what it closes.
 */
export const drawer = {
  /** The menu button's accessible name. */
  button: "Open main menu",
  /** The drawer's accessible name. */
  label: "Main menu",
  /** The drawer's close button's accessible name. */
  close: "Close main menu",
} as const;

/**
 * The primary navigation's accessible name.
 *
 * It names the navigation landmark in the header, and it is the same on every
 * width: the drawer holds the same destinations under the same name.
 */
export const mainNav = {
  label: "Main",
} as const;

/**
 * An entry in the primary navigation.
 *
 * An entry is either a destination of its own, or a trigger with a panel of
 * destinations behind it. A trigger goes nowhere itself: the original's
 * Resources and Craft Apps entries open their panels and are not links.
 */
export type NavEntry =
  | (NavLink & { children?: undefined })
  | { label: string; href?: undefined; children: NavLink[] };

/**
 * The pages of the original site behind the Resources panel — and behind the
 * footer's Resources group, which lists the same destinations.
 */
export const resourcesLinks: NavLink[] = [
  { label: "Tutorials", href: originalPage("/tutorials"), external: true },
  { label: "News", href: originalPage("/news"), external: true },
  { label: "FAQ", href: originalPage("/faq"), external: true },
  { label: "Press Kit", href: originalPage("/press-kit"), external: true },
  { label: "Support", href: originalPage("/support"), external: true },
];

/**
 * The Craft Apps pages: the destinations behind the Craft Apps panel, and
 * behind the footer's Craft Apps group, which lists the same pages.
 */
export const craftAppsLinks: NavLink[] = [
  { label: "All Craft Apps", href: originalPage("/apps"), external: true },
  {
    label: "PhotoCraft",
    href: originalPage("/apps/photocraft"),
    external: true,
  },
  {
    label: "VectorCraft",
    href: originalPage("/apps/vectorcraft"),
    external: true,
  },
  {
    label: "FilmCraft",
    href: originalPage("/apps/filmcraft"),
    external: true,
  },
  {
    label: "LightCraft",
    href: originalPage("/apps/lightcraft"),
    external: true,
  },
  {
    label: "PdfCraft",
    href: originalPage("/apps/pdfcraft"),
    external: true,
  },
  {
    label: "EffectCraft",
    href: originalPage("/apps/effectcraft"),
    external: true,
  },
  {
    label: "DesignCraft",
    href: originalPage("/apps/designcraft"),
    external: true,
  },
  {
    label: "FigCraft",
    href: originalPage("/apps/figcraft"),
    external: true,
  },
  {
    label: "WordCraft",
    href: originalPage("/apps/wordcraft"),
    external: true,
  },
  {
    label: "SoundCraft",
    href: originalPage("/apps/soundcraft"),
    external: true,
  },
  {
    label: "DeckCraft",
    href: originalPage("/apps/deckcraft"),
    external: true,
  },
  {
    label: "CADCraft",
    href: originalPage("/apps/cadcraft"),
    external: true,
  },
  {
    label: "GridCraft",
    href: originalPage("/apps/gridcraft"),
    external: true,
  },
];

export const headerNav: NavEntry[] = [
  { label: "Home", href: "/" },
  { label: "Image", href: "https://app.getartcraft.com/create-image", external: true },
  { label: "Video", href: "https://app.getartcraft.com/create-video", external: true },
  { label: "Resources", children: resourcesLinks },
  { label: "Download", href: originalPage("/download"), external: true },
  { label: "Support", href: originalPage("/support"), external: true },
  { label: "Craft Apps", children: craftAppsLinks },
];

/** The links on the right of the header, before the theme toggle. */
export const headerAside: NavLink[] = [
  { label: "Pricing", href: originalPage("/pricing"), external: true },
  { label: "Join the ArtCraft Discord", href: site.discord, external: true },
];

export const launchApp: NavLink = { label: "Launch App", href: site.app, external: true };

/** The hero. */
export const hero = {
  wordmark: "ARTCRAFT",
  headline: {
    before: "Capable tools",
    accent: "for artists.",
    after: "",
    accentMuted: true,
  } satisfies Headline,
  body: "ArtCraft builds open source tools for artists. We pride ourselves on freedom of control and expression.",
  actions: [
    {
      label: "Download free",
      href: originalPage("/download"),
      variant: "primary",
      external: true,
    },
    { label: "Use on web", href: site.app, variant: "secondary", external: true },
  ] satisfies Action[],
  facts: [
    { label: "Open source on GitHub", href: site.repository, external: true },
    { label: "macOS · Windows · Web" },
    { label: "No subscription required" },
  ],
} as const;

/** The Marquee. */
export const marquee: string[] = [
  "Seedance 2.5",
  "Nano Banana 2",
  "Image to Location",
  "3D Compositing",
  "Character Posing",
  "Image to 3D Mesh",
  "Background Removal",
  "2D Compositing",
  "Mixed Assets",
];

/** The Features section. */
export const features = {
  bar: {
    number: "01",
    subject: "Crafting features",
    descriptor: "Real footage — captured in ArtCraft",
  } satisfies SectionBar,
  headline: {
    before: "The control that mere",
    accent: "words",
    after: "cannot buy.",
  } satisfies Headline,
  body: "Text prompting is neat, but artists crave control. Compose the shot yourself — then let the model render it.",
  entries: [
    {
      kind: "video",
      category: "Worlds",
      index: "01",
      title: "Image to Location",
      body: "Place virtual actors into physical environments. Establish single-location consistency and film multiple shots in a room without things disappearing.",
      video: { src: "/videos/features/WorldLabs_Demo_2.webm", label: "Image to Location demo" },
    },
    {
      kind: "video",
      category: "3D Compositing",
      index: "02",
      title: "Build scenes with depth",
      body: "Use images, backdrops, foreground elements, and props in scenes with real depth. A couple of images blends naturally into a finished composition.",
      video: { src: "/videos/features/Panel.webm", label: "Build scenes with depth demo" },
    },
    {
      kind: "video",
      category: "2D Compositing",
      index: "03",
      title: "Precise layered control",
      body: "Combine images, background removal, layers, and simple drawing tools to compose a scene exactly the way you imagined it.",
      video: { src: "/videos/features/Editor.webm", label: "Precise layered control demo" },
    },
    {
      kind: "video",
      category: "3D Mesh",
      index: "04",
      title: "Image to 3D Mesh",
      body: "Turning images into 3D helps position elements exactingly. Block complex scenes with intentional geometry instead of fighting prompts.",
      video: { src: "/videos/features/Make_3D.webm", label: "Image to 3D Mesh demo" },
    },
    {
      kind: "video",
      category: "Mixed Assets",
      index: "05",
      title: "Mix every kind of asset",
      body: "Combine image cutouts, worlds, and 3D meshes in one canvas to lay out scenes with precision and intention.",
      video: { src: "/videos/features/Mixed.webm", label: "Mix every kind of asset demo" },
    },
    {
      kind: "video",
      category: "Posing",
      index: "06",
      title: "Character Posing",
      body: 'Dynamically pose your characters to nail the precise character, scene, and camera blocking before calling "action".',
      video: { src: "/videos/features/Character-Pose.webm", label: "Character Posing demo" },
    },
    {
      kind: "video",
      category: "Cutouts",
      index: "07",
      title: "Background Removal",
      body: "Instantly remove backgrounds from images to create assets for your scenes. Clean, precise, and ready for compositing.",
      video: { src: "/videos/features/Background.webm", label: "Background Removal demo" },
    },
    {
      kind: "link",
      category: "More in the app",
      index: "08",
      title: "Launch the studio",
      body: "Generate, edit, and compose with every model — right in your browser, no install needed.",
      action: {
        label: "app.getartcraft.com",
        href: site.app,
        external: true,
      },
    },
  ] satisfies FeatureEntry[],
} as const;

/** The Ownership section. */
export const ownership = {
  bar: {
    number: "02",
    subject: "Ownership",
    descriptor: "Free & open source",
  } satisfies SectionBar,
  headline: {
    before: "Stop",
    accent: "renting",
    after: "from websites.",
  } satisfies Headline,
  body: "ArtCraft is yours to own and keep, forever. No subscriptions needed, no aggregator middleman, no rent payments.",
  entries: [
    {
      letter: "A",
      title: "Open source",
      body: "The whole studio is on GitHub. Read it, fork it, make it yours.",
      action: { label: "View source", href: site.repository, external: true },
    },
    {
      letter: "B",
      title: "Yours forever",
      body: "ArtCraft is yours to own and keep, forever. No rent payments.",
    },
    {
      letter: "C",
      title: "No middleman",
      body: "No aggregator between you and the models. Your work stays yours.",
    },
  ] satisfies OwnershipEntry[],
} as const;

/** The Proof section. */
export const proof = {
  bar: {
    number: "03",
    subject: "Proof",
    descriptor: "From the community",
  } satisfies SectionBar,
  headline: {
    before: "Made",
    accent: "with",
    after: "ArtCraft.",
  } satisfies Headline,
  /** The play affordance's own copy: the chip's label, and the control's name. */
  play: {
    label: "Play",
    /**
     * The accessible name of a play control: this prefix, then the film's
     * title — "Play video: Made with ArtCraft #1".
     */
    namePrefix: "Play video:",
  },
  entries: [
    {
      label: "Community film",
      index: "01",
      title: "Made with ArtCraft #1",
      poster: "/images/films/made-with-artcraft-1.jpg",
      href: "https://www.youtube.com/watch?v=HDdsKJl92H4",
      external: true,
    },
    {
      label: "Community film",
      index: "02",
      title: "Made with ArtCraft #2",
      poster: "/images/films/made-with-artcraft-2.jpg",
      href: "https://www.youtube.com/watch?v=oqoCWdOwr2U",
      external: true,
    },
    {
      label: "Community film",
      index: "03",
      title: "Made with ArtCraft #3",
      poster: "/images/films/made-with-artcraft-3.jpg",
      href: "https://www.youtube.com/watch?v=H4NFXGMuwpY",
      external: true,
    },
  ] satisfies FilmEntry[],
} as const;

/** The Start section. */
export const start = {
  bar: {
    number: "04",
    subject: "Start",
    descriptor: "Free to start · No subscription",
  } satisfies SectionBar,
  eyebrow: "Free to start · No subscription",
  headline: {
    before: "Start",
    accent: "crafting",
    after: ".",
  } satisfies Headline,
  body: "Download the studio, or run it in your browser. Your first renders are minutes away.",
  actions: [
    {
      label: "Download for desktop",
      href: originalPage("/download"),
      variant: "primary",
      external: true,
    },
    { label: "Launch in browser", href: site.app, variant: "secondary", external: true },
  ] satisfies Action[],
} as const;

/** The footer. */
export const footer = {
  groups: [
    {
      label: "Product",
      links: [
        { label: "Download", href: originalPage("/download"), external: true },
        { label: "Pricing", href: originalPage("/pricing"), external: true },
        { label: "Launch App", href: site.app, external: true },
      ],
    },
    {
      label: "Craft Apps",
      links: craftAppsLinks,
    },
    {
      label: "Resources",
      links: resourcesLinks,
    },
    {
      label: "Community",
      links: [
        { label: "Discord", href: site.discord, external: true },
        { label: "GitHub", href: site.repository, external: true },
        { label: "YouTube", href: "https://www.youtube.com/@OfficialArtCraftStudios", external: true },
        { label: "Instagram", href: "https://www.instagram.com/get_artcraft", external: true },
        { label: "TikTok", href: "https://www.tiktok.com/@artcraft.studios", external: true },
      ],
    },
  ] satisfies NavGroup[],
  copyright: "© 2026 ArtCraft",
  maker: "Made by artists, for artists",
} as const;

/** The Orbit's floating photo tiles. The images are still frames of the demo videos. */
export type OrbitTile = {
  src: string;
  alt: string;
  /** Percentage positions within the Orbit's box. */
  x: number;
  y: number;
  /** The tile's width as a percentage of the Orbit's width. */
  width: number;
  /** How deep the tile sits: 0 is nearest the viewer, 1 is furthest. */
  depth: number;
  /** The drift animation's duration, in seconds. */
  duration: number;
};

export const orbitTiles: OrbitTile[] = [
  { src: "/images/orbit/tile-01.jpg", alt: "", x: 46, y: 6, width: 9, depth: 0.2, duration: 26 },
  { src: "/images/orbit/tile-02.jpg", alt: "", x: 59, y: 12, width: 14, depth: 0.05, duration: 34 },
  { src: "/images/orbit/tile-03.jpg", alt: "", x: 78, y: 10, width: 20, depth: 0, duration: 30 },
  { src: "/images/orbit/tile-04.jpg", alt: "", x: 31, y: 21, width: 9, depth: 0.35, duration: 38 },
  { src: "/images/orbit/tile-05.jpg", alt: "", x: 69, y: 29, width: 16, depth: 0.12, duration: 28 },
  { src: "/images/orbit/tile-06.jpg", alt: "", x: 88, y: 40, width: 15, depth: 0.18, duration: 33 },
  { src: "/images/orbit/tile-07.jpg", alt: "", x: 53, y: 36, width: 11, depth: 0.45, duration: 40 },
  { src: "/images/orbit/tile-08.jpg", alt: "", x: 14, y: 60, width: 14, depth: 0.5, duration: 36 },
  { src: "/images/orbit/tile-09.jpg", alt: "", x: 26, y: 74, width: 13, depth: 0.28, duration: 31 },
  { src: "/images/orbit/tile-10.jpg", alt: "", x: 80, y: 78, width: 18, depth: 0.22, duration: 35 },
];

/** The Orbit's rings and arcs, measured off the original's capture. */
export type OrbitRing = {
  /** The ring's diameter as a percentage of the Orbit's width. */
  diameter: number;
  /** Whether the ring carries tick marks. */
  ticks?: boolean;
  /** The weight of the ring's stroke, in pixels. */
  weight?: number;
  /** The arc's sweep, in degrees, and where it starts. */
  arc?: { start: number; sweep: number };
  /**
   * The token name of the arc's colour. In the light theme the arcs read as
   * grey; in the dark theme they carry colour. The value lives in the token
   * layer, not here.
   */
  color?: "orbit-arc-1" | "orbit-arc-2" | "orbit-arc-3";
};

/**
 * The rings, measured off `docs/reference/screenshots/hero-light-1440.webp`: the
 * faint lines cross a tile-free band of the capture about 92 pixels apart, and
 * they are concentric about a point below and very slightly right of the
 * canvas's centre.
 *
 * The four heavy arcs are measured off the same capture. The left one crosses
 * the page at x≈245 when y=600; the upper-left one runs through the top-left
 * of the light theme; the top-right and the bottom-right ones run through the
 * opposite corners, where the dark theme's blue and magenta arcs show. A
 * radius in pixels is written here as the percentage of the Orbit's width it
 * is: 485px is 67.4%, 650px is 90.3%, 714px is 99.2% and 570px is 79.2%.
 */
export const orbitRings: OrbitRing[] = [
  { diameter: 42.4, ticks: true, weight: 1 },
  { diameter: 55.1, ticks: true, weight: 1 },
  { diameter: 68.1, ticks: true, weight: 1 },
  { diameter: 80.3, ticks: true, weight: 1 },
  { diameter: 93.1, ticks: true, weight: 1 },
  { diameter: 106.3, ticks: true, weight: 1 },
  { diameter: 67.4, weight: 4, arc: { start: 160, sweep: 45 }, color: "orbit-arc-1" },
  { diameter: 90.3, weight: 4, arc: { start: 214, sweep: 21 }, color: "orbit-arc-1" },
  { diameter: 99.2, weight: 4, arc: { start: 295, sweep: 45 }, color: "orbit-arc-2" },
  { diameter: 79.2, weight: 4, arc: { start: 10, sweep: 40 }, color: "orbit-arc-3" },
];
