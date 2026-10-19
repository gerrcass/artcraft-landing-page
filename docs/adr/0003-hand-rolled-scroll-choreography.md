# Hand-roll scroll choreography without an animation library

The Features, Ownership, Proof, and Start sections reproduce the original's
scroll-linked choreography — demo videos that scrub and reveal as the page moves —
without adopting an animation library such as Motion or GSAP. The behaviour is
narrower than those libraries target: a video is either playing or paused based on
whether its Media Well is in view, and elements reveal once. CSS scroll-driven
animations (`animation-timeline: view()`) cover the reveal case natively where
supported, with an IntersectionObserver fallback for the rest, and video playback is
driven by the same observer. Pulling in a general-purpose animation runtime for this
would add the heaviest dependency in the project to implement behaviour that fits in a
small amount of platform code, and would make the reduced-motion path harder to
guarantee.
