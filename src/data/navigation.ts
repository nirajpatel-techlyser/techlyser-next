export interface NavigationItem {
  id: number;
  label: string;
  href: string;
}

export const navigation: NavigationItem[] = [
  {
    id: 1,
    label: "Home",
    href: "/",
  },
  {
    id: 2,
    label: "Services",
    href: "/services",
  },
  {
    id: 3,
    label: "Portfolio",
    href: "/portfolio",
  },
  {
    id: 4,
    label: "Blog",
    href: "/blog",
  },
  {
    id: 5,
    label: "Resources",
    href: "/resources",
  },
  {
    id: 6,
    label: "About",
    href: "/about",
  },
  {
    id: 7,
    label: "Contact",
    href: "/contact",
  },
];
