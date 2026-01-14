"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import React from "react";
import { Home } from "lucide-react";
import { useHasMounted } from "@/hooks/use-has-mounted";

const Breadcrumb = () => {
  const pathname = usePathname();
  const mounted = useHasMounted();

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

  const isHome = breadcrumbs.length === 0;

  return (
    <BreadcrumbRoot className="backdrop-blur-md uppercase px-4 py-2 rounded-full bg-background/40 border border-border/10 min-w-0 shrink overflow-hidden">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center justify-center cursor-can-hover">
              {/* Desktop: Always show text */}
              <span className="hidden md:inline text-lg font-bold">
                XERA-2011
              </span>
              {/* Mobile: Show text if home, else show icon */}
              <span className={cn("md:hidden font-bold text-base", isHome ? "inline" : "hidden")}>
                XERA-2011
              </span>
              <Home className={cn("md:hidden w-4 h-4", isHome ? "hidden" : "block")} />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.length > 0 && <BreadcrumbSeparator className="shrink-0" />}

        {/* Mobile View: Ellipsis if more than 1 item */}
        {breadcrumbs.length > 1 && (
          <>
            <BreadcrumbItem className="md:hidden shrink-0">
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="md:hidden shrink-0" />
          </>
        )}

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          // On mobile, only show the last item
          const isVisibleOnMobile = isLast;

          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem className={cn("shrink-0", isVisibleOnMobile ? "" : "hidden md:inline-flex")}>
                {isLast ? (
                  <BreadcrumbPage className="font-medium truncate max-w-30 sm:max-w-none">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={crumb.href}
                      className="font-bold hover:text-muted-foreground transition-colors cursor-can-hover"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator className={cn("shrink-0", isVisibleOnMobile ? "" : "hidden md:list-item")} />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
};

export default Breadcrumb;
