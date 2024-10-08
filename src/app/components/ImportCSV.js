import React from "react";

function ImportCSV({ fileInputRef, handleFileUpload, handleClickImportFile }) {
  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={(e) => {
          handleFileUpload(e);
        }}
        style={{ display: "none" }}
      />
      <button
        className="px-2 py-2 text-white bg-gray-500 rounded "
        onClick={handleClickImportFile}
      >
        Import
      </button>
    </>
  );
}

export default ImportCSV;
