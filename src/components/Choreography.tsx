"use client"

import { useChoreography } from "@/lib/choreography"

import "@/lib/choreography.css"

/**
 * The Choreography, mounted once for the page.
 *
 * It renders nothing: the choreography is behaviour, not content. The page
 * layout mounts it, and the shared observer it starts watches the whole
 * document for the elements the marks select.
 */
export function Choreography() {
  useChoreography()

  return null
}
