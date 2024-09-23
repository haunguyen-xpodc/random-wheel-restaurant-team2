import { XCircleIcon } from "@heroicons/react/24/outline";

export default function HistoryDialog({
  open,
  setOpen,
  history,
  removeHistory,
  removeAll,
}) {
  return (
    open && (
      <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-50">
        <div className="p-4 bg-white rounded-lg w-[500px]">
          <h1 className="w-full mb-6 text-xl font-bold border-b border-gray-300">
            Wheel history
          </h1>
          <div className="grid gap-2 mb-6">
            {history.length > 0 ? (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 pb-2 border-b border-gray-100"
                >
                  <p>{item}</p>
                  <p
                    className="text-sm cursor-pointer"
                    onClick={() => removeHistory(idx)}
                  >
                    <XCircleIcon className="size-5" />
                  </p>
                </div>
              ))
            ) : (
              <p className="text-lg text-center">No history yet</p>
            )}
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 text-black border border-red-500 rounded-md"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <button
              className="px-4 py-2 text-white bg-red-400 rounded-md"
              onClick={removeAll}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    )
  );
}
