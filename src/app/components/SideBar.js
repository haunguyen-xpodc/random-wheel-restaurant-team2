"use client";

import React from "react";

export const Header = ({ children }) => {

    return (
        <header
            className="w-full h-16 bg-gray-200 border-solid border-b-2 border-stone-200 shadow-xl flex justify-between items-center px-6 mb-4"
        >
            {children}
        </header>
    );
};
