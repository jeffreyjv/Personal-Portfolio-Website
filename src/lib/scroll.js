/**
 * Scroll to a section and move focus there, so a keyboard user's next Tab
 * continues from the destination rather than the top of the page.
 * `scroll-margin-top` in index.css keeps the heading clear of the fixed navbar.
 */
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "start" });

  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
