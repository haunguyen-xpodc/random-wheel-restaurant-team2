import React, { useState } from 'react'
import { ArrowPathIcon } from "@heroicons/react/24/solid";

function ListRestaurant({ restaurants, deleteRestaurant, setRestaurants }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative min-w-[300px]">
            <div
                className="border bg-white rounded border-[#ccc] p-2 flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <p className="text-md font-light text-gray-400">List restaurants</p>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border border-t-0 border-[#ccc] max-h-[50vh] overflow-auto">
                    <div className="p-2 border-b border-gray-100 flex justify-end">
                        <button
                            className="text-sm text-blue-500 hover:text-blue-700"
                            onClick={() => {
                                const tempRestaurants = [...restaurants];
                                for (let i = tempRestaurants.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [tempRestaurants[i], tempRestaurants[j]] = [
                                        tempRestaurants[j],
                                        tempRestaurants[i],
                                    ];
                                }
                                setRestaurants(tempRestaurants);
                            }}
                        >
                            <ArrowPathIcon className="size-6 text-gray-500 mr-2" />
                        </button>
                    </div>
                    {restaurants.map((name, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between border-b border-gray-100 gap-6 p-4 hover:bg-gray-100"
                        >
                            <p className="text-sm text-gray-900">{name}</p>
                            <button
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => deleteRestaurant(index)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ListRestaurant