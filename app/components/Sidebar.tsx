// components/Sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useFetchCategories from "@/hooks/fetch-categories";

const Sidebar = () => {
  const { data, isLoading, isError } = useFetchCategories();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading categories</div>;

  return (
    <div className="hidden xl:block fixed top-12 left-0">
      <div className="flex w-[270px] h-[calc(100vh-48px)] xl:flex flex-col bg-primary">
        <div className="flex-1">
          <div className="text-[10px] uppercase px-5 pb-1 pt-3 text-primary">
            Categories
          </div>
          <div className="max-h-[336px] overflow-auto mobile-scrollbar mobile-scrollbar-vertical">
            {data?.map((category) => (
              <Link key={category.id} href={`/category/${category.name}`}>
                <Button className="w-full rounded-none justify-start" variant="default">
                  <span className="mr-2">{category.icon}</span>  {/* Render the icon */}
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
