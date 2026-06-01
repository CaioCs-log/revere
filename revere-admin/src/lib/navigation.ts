/**
 * Dashboard Navigation Configuration
 */

export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const adminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Produtos", href: "/dashboard/products" },
  { name: "Variantes", href: "/dashboard/variants" },
  { name: "Categorias", href: "/dashboard/categories" },
  { name: "Tags", href: "/dashboard/tags" },
  { name: "Kits", href: "/dashboard/kits" },
  { name: "Bairros e Frete", href: "/dashboard/neighborhoods" },
  { name: "Conteúdo", href: "/dashboard/content" },
  { name: "Pedidos", href: "/dashboard/orders" },
];
