# Vendor the original site's media and copy into the repo

The clone reproduces the live site's copy verbatim and vendors its demo videos, font
files, logo, and community film posters into `public/` and `src/data/site.ts`, rather
than hotlinking the CDN or writing substitute copy. A visual clone only demonstrates
anything if the result can be diffed against the source, and that requires identical
text and identical imagery. The cost is roughly 18.5 MB of video and a first commit
that carries another project's assets, which is why this was recorded explicitly: a
future reader looking at 18 MB of WebM files in a repository named
`artcraft-landing-page` should know that is deliberate, and that the media is
demonstration content for a local clone rather than something the project ships.
