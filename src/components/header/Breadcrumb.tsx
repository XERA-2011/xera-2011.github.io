"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo, useEffect, useState } from "react";

const Breadcrumb = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const breadcrumbs = useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    const crumbs: Array<{ label: string; href: string }> = [];
    let currentPath = "";

    paths.forEach((path) => {
      currentPath += `/${path}`;
      crumbs.push({
        label: path.toUpperCase(),
        href: currentPath
      });
    });

    return crumbs;
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm" style={{ textTransform: 'none' }}>
      <Link href="/" className="flex items-center justify-center cursor-can-hover">
        <span className="text-base md:text-lg font-bold">
          XERA-2011
        </span>
      </Link>
      {breadcrumbs.length > 0 && (
        <>
          <span className="text-muted-foreground">/</span>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-muted-foreground">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-muted-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="font-bold hover:text-muted-foreground transition-colors cursor-can-hover"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
