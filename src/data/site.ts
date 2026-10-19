/**
 * The content module: every word of copy on the landing page, in one typed place.
 *
 * Components read from here and carry no copy of their own. The copy is transcribed
 * verbatim from the original site — see `docs/agents/reference-notes.md` for the
 * transcription it came from.
 */

/** A destination. `external` means it leaves the clone for the original site. */
export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

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
      action: { label: string; href: string };
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
};

/** The site itself: who made it and how to reach them. */
export const site = {
  title: "ArtCraft — Controllable AI for Artists",
  description:
    "ArtCraft is the open-source desktop app for generating AI video and images — built for artists who want real control.",
  email: "hello@storyteller.ai",
  tagline: "The open-source studio for controllable AI image and video.",
  logo: "/artcraft-icon.svg",
  repository: "https://github.com/storytold/artcraft",
  app: "https://app.getartcraft.com/",
  discord: "https://discord.gg/artcraft",
} as const;

/** The primary navigation. A link with `children` opens a dropdown panel. */
export type NavEntry = NavLink & { children?: NavLink[] };

export const headerNav: NavEntry[] = [
  { label: "Home", href: "/" },
  { label: "Image", href: "https://app.getartcraft.com/create-image", external: true },
  { label: "Video", href: "https://app.getartcraft.com/create-video", external: true },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Tutorials", href: "/tutorials" },
      { label: "News", href: "/news" },
      { label: "FAQ", href: "/faq" },
      { label: "Press Kit", href: "/press-kit" },
      { label: "Support", href: "/support" },
    ],
  },
  { label: "Download", href: "/download" },
  { label: "Support", href: "/support" },
  {
    label: "Craft Apps",
    href: "/apps",
    children: [
      { label: "All Craft Apps", href: "/apps" },
      { label: "PhotoCraft", href: "/apps/photocraft" },
      { label: "VectorCraft", href: "/apps/vectorcraft" },
      { label: "FilmCraft", href: "/apps/filmcraft" },
      { label: "LightCraft", href: "/apps/lightcraft" },
      { label: "PdfCraft", href: "/apps/pdfcraft" },
      { label: "EffectCraft", href: "/apps/effectcraft" },
      { label: "DesignCraft", href: "/apps/designcraft" },
      { label: "FigCraft", href: "/apps/figcraft" },
      { label: "WordCraft", href: "/apps/wordcraft" },
      { label: "SoundCraft", href: "/apps/soundcraft" },
      { label: "DeckCraft", href: "/apps/deckcraft" },
      { label: "CADCraft", href: "/apps/cadcraft" },
      { label: "GridCraft", href: "/apps/gridcraft" },
    ],
  },
];

/** The links on the right of the header, before the theme toggle. */
export const headerAside: NavLink[] = [
  { label: "Pricing", href: "/pricing" },
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
    { label: "Download free", href: "/download", variant: "primary" },
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
  entries: [
    {
      label: "Community film",
      index: "01",
      title: "Made with ArtCraft #1",
      poster: "/images/films/made-with-artcraft-1.jpg",
      href: "https://www.youtube.com/watch?v=HDdsKJl92H4",
    },
    {
      label: "Community film",
      index: "02",
      title: "Made with ArtCraft #2",
      poster: "/images/films/made-with-artcraft-2.jpg",
      href: "https://www.youtube.com/watch?v=oqoCWdOwr2U",
    },
    {
      label: "Community film",
      index: "03",
      title: "Made with ArtCraft #3",
      poster: "/images/films/made-with-artcraft-3.jpg",
      href: "https://www.youtube.com/watch?v=H4NFXGMuwpY",
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
    { label: "Download for desktop", href: "/download", variant: "primary" },
    { label: "Launch in browser", href: site.app, variant: "secondary", external: true },
  ] satisfies Action[],
} as const;

/** The footer. */
export const footer = {
  groups: [
    {
      label: "Product",
      links: [
        { label: "Download", href: "/download" },
        { label: "Pricing", href: "/pricing" },
        { label: "Launch App", href: site.app, external: true },
      ],
    },
    {
      label: "Craft Apps",
      links: [
        { label: "All Craft Apps", href: "/apps" },
        { label: "PhotoCraft", href: "/apps/photocraft" },
        { label: "VectorCraft", href: "/apps/vectorcraft" },
        { label: "FilmCraft", href: "/apps/filmcraft" },
        { label: "LightCraft", href: "/apps/lightcraft" },
        { label: "PdfCraft", href: "/apps/pdfcraft" },
        { label: "EffectCraft", href: "/apps/effectcraft" },
        { label: "DesignCraft", href: "/apps/designcraft" },
        { label: "FigCraft", href: "/apps/figcraft" },
        { label: "WordCraft", href: "/apps/wordcraft" },
        { label: "SoundCraft", href: "/apps/soundcraft" },
        { label: "DeckCraft", href: "/apps/deckcraft" },
        { label: "CADCraft", href: "/apps/cadcraft" },
        { label: "GridCraft", href: "/apps/gridcraft" },
      ],
    },
    {
      label: "Resources",
      links: [
        { label: "Tutorials", href: "/tutorials" },
        { label: "News", href: "/news" },
        { label: "FAQ", href: "/faq" },
        { label: "Press Kit", href: "/press-kit" },
        { label: "Support", href: "/support" },
      ],
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

/** The Orbit's rings and arcs, in the original's proportions. */
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

export const orbitRings: OrbitRing[] = [
  { diameter: 26, ticks: true, weight: 1 },
  { diameter: 44, ticks: true, weight: 1 },
  { diameter: 62, ticks: true, weight: 1 },
  { diameter: 80, ticks: true, weight: 1 },
  { diameter: 98, ticks: true, weight: 1 },
  { diameter: 118, ticks: true, weight: 1 },
  { diameter: 44, weight: 2, arc: { start: 90, sweep: 45 }, color: "orbit-arc-1" },
  { diameter: 62, weight: 2, arc: { start: 200, sweep: 90 }, color: "orbit-arc-2" },
  { diameter: 80, weight: 2, arc: { start: 20, sweep: 70 }, color: "orbit-arc-3" },
  { diameter: 98, weight: 2, arc: { start: 300, sweep: 60 }, color: "orbit-arc-1" },
];
