import React from 'react'

function Search({ handleChangeSearch, handleClearSearch, keyword, showSuggestions, listSuggestLocation, addRestaurant }) {
    return (
        <div className='min-w-[300px] max-w-[400px]'>
            <div className='relative'>
                <input
                    placeholder="Choose option for wheel!"
                    value={keyword}
                    onChange={(e) => handleChangeSearch(e)}
                    className="w-full p-2 border rounded"
                />
                {keyword && (
                    <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={handleClearSearch}
                    >
                        ✕
                    </button>
                )}
            </div>
            {showSuggestions && listSuggestLocation?.length > 0 && (
                <div className="list-locations absolute bg-white border mt-1 z-10 rounded shadow-lg">
                    {listSuggestLocation.map((item, idx) => (
                        <p
                            key={idx}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={addRestaurant(item?.structured_formatting?.main_text)}
                        >
                            {item.description}
                        </p>
                    ))}
                </div>
            )}
        </div>

    )
}

export default Search