"use client";

import React from "react";

export const Header = ({ children }) => {
  return (
    <header className="flex flex-col items-baseline justify-center gap-2 p-4 px-6 mb-4 bg-gray-200 border-b-2 border-solid shadow-xl w-dvw h-fit border-stone-200 sm:flex-col md:flex-col md:w-full lg:flex-row">
      {children}
    </header>
  );
};
