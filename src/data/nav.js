/** Shared by the Navbar and the command palette so they can never drift apart. */
export const navItems = [
  { id: "about", name: "About", href: "#about" },
  { id: "skills", name: "Skills", href: "#skills" },
  { id: "projects", name: "Projects", href: "#projects" },
  { id: "contact", name: "Contact", href: "#contact" },
];

/** Every scroll target, including the hero — the order drives scroll-spy. */
export const sectionIds = ["hero", ...navItems.map((i) => i.id)];
