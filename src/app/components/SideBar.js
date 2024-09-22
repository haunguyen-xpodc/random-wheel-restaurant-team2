"use client";

import React from "react";

export const Header = ({ children }) => {

    return (
        <header
            className="w-dvw h-fit p-4 gap-2 bg-gray-200 border-solid border-b-2 border-stone-200 shadow-xl flex flex-col sm:flex-col justify-center items-baseline px-6 mb-4 md:flex-col md:w-full lg:flex-row"
        >
            {children}
        </header>
    );
};
