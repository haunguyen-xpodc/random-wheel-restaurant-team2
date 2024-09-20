import React from 'react'

function ImportCSV({ fileInputRef, handleFileUpload, handleClickImportFile }) {
    return (
        <>
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={(e) => {
                    handleFileUpload(e)
                }}
                style={{ display: 'none' }}
            />
            <button
                className="px-4 py-1 bg-gray-500 text-white rounded "
                onClick={handleClickImportFile}
            >
                Import
            </button>
        </>

    )
}

export default ImportCSV