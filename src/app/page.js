"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./randomwheel.module.css";
import axios from "axios";
import HistoryDialog from "./components/HistoryDialog";
import * as XLSX from 'xlsx';

const initialRestaurants = [];

export default function RandomWheel() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [restaurants, setRestaurants] = useState([]);
  const [chosenRestaurant, setChosenRestaurant] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const API_KEY = "xYMZRYtUiOGz90R5Lt3z7uAAJWaZb22L3hv4SKWs";
  const [listSuggestLocation, setListSuggestLocation] = useState();
  const [keyword, setKeyword] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debounce = (func, wait) => {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  function randomHexColor() {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  }

  const spinWheel = () => {
    if (!restaurants?.length || restaurants?.length < 2) {
      alert("Please add more restaurants");
      return;
    }

    if (isSpinning) return;
    setIsSpinning(true);

    const canvas = canvasRef.current;
    const spins = 5 + Math.random() * 5;
    const arc = (Math.PI * 2) / restaurants?.length;
    const spinAngle = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + spinAngle;

    canvas.style.transform = `rotate(${totalRotation - Math.PI / 2}rad)`;

    const finalAngle = totalRotation % (Math.PI * 2);
    const selectedIndex = Math.floor(
      (restaurants?.length - finalAngle / arc) % restaurants?.length
    );

    setTimeout(() => {
      setChosenRestaurant(restaurants[selectedIndex]);
      setHistory((history) => {
        localStorage.setItem(
          "history",
          JSON.stringify([...history, restaurants[selectedIndex]])
        );
        return [...history, restaurants[selectedIndex]];
      });
      setShowResult(true);
      setIsSpinning(false);
    }, 5000);
  };

  const addRestaurant = (value) => () => {
    const updatedRestaurants = [...restaurants, value];
    setRestaurants(updatedRestaurants);
    localStorage.setItem("restaurants", JSON.stringify(updatedRestaurants));
    setKeyword("");
    setShowSuggestions(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        console.log('data', data)
        const workbook = XLSX.read(data, { type: 'binary' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const importData = sheetData.map(row => row.join(', '));
        setRestaurants(prevRestaurants => {
          const updatedRestaurants = [...prevRestaurants, ...importData];
          localStorage.setItem("restaurants", JSON.stringify(updatedRestaurants));
          return updatedRestaurants;
        });
      };

      reader.readAsBinaryString(file);
    }
    event.target.value = ''
  };

  const handleClickOutside = (event) => {
    if (event.target.closest('.form-add-restaurant')) return;
    setShowSuggestions(false);
  };

  const deleteRestaurant = (index) => {
    const updatedRestaurants = restaurants.filter((_, i) => i !== index);
    setRestaurants(updatedRestaurants);
    localStorage.setItem("restaurants", JSON.stringify(updatedRestaurants));
  };

  const fetchSuggesstLocation = async (keyword) => {
    const data = await axios.get(
      `https://rsapi.goong.io/Place/AutoComplete?api_key=${API_KEY}&input=${keyword}`
    );
    if (data.status === 200) {
      setListSuggestLocation(data.data.predictions);
      setShowSuggestions(true);
    }
  };

  const removeHistory = (idx) => {
    const updatedHistory = [...history];
    updatedHistory.splice(idx, 1);
    setHistory(updatedHistory);
    localStorage.setItem("history", JSON.stringify(updatedHistory));
  };

  const removeAllHistory = () => {
    setHistory([]);
    localStorage.setItem("history", JSON.stringify([]));
  };

  useEffect(() => {
    const savedRestaurants = localStorage.getItem("restaurants");
    if (savedRestaurants) {
      setRestaurants(JSON.parse(savedRestaurants));
    } else {
      setRestaurants(initialRestaurants);
      localStorage.setItem("restaurants", JSON.stringify(initialRestaurants));
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const historyRestaurants = localStorage.getItem("history");
    if (historyRestaurants) {
      setHistory(JSON.parse(historyRestaurants));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    resizeCanvas();
    drawWheel();

    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);

    function resizeCanvas() {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawWheel();
    }
    function truncateText(text, maxWidth) {
      let truncated = text;
      while (ctx.measureText(truncated).width > maxWidth) {
        truncated = truncated.slice(0, -1);
      }
      return truncated.length < text.length ? truncated + "..." : truncated;
    }

    function drawWheel() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.max(Math.min(centerX, centerY) - 10, 0); // Ensure radius is non-negative
      const totalRestaurants = restaurants?.length;
      if (totalRestaurants === 0) return; // Handle case where there are no restaurants
      const arc = (Math.PI * 2) / totalRestaurants;
      for (let i = 0; i < totalRestaurants; i++) {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = randomHexColor();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#333";
        ctx.font = "bold 12px Arial";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        const maxTextWidth = radius * 0.7; // Adjust this value to change the maximum text width
        const truncatedText = truncateText(restaurants[i], maxTextWidth);

        ctx.strokeText(truncatedText, radius - 10, 5);
        ctx.fillText(truncatedText, radius - 10, 5);
        ctx.restore();
      }
    }
  }, [restaurants]); // Add restaurants as a dependency

  return (
    <div className={`${styles.body}`}>
      <div className="relative flex items-center justify-center gap-10 px-4 md:px-16 lg:px-24 max-xl:flex-col-reverse w-full">
        <HistoryDialog
          open={showHistory}
          setOpen={setShowHistory}
          history={history}
          removeHistory={(idx) => removeHistory(idx)}
          removeAll={removeAllHistory}
        />

        <div className="flex gap-10 max-xl:flex-col">
          <div className={`${styles.wheelContainer} shrink-0`}>
            <div className={styles.selector}></div>
            <canvas ref={canvasRef} className={styles.wheel}></canvas>
            <button
              className={styles.wheelCenter}
              onClick={spinWheel}
              aria-label="Spin the wheel"
            >
              SPIN
            </button>
          </div>
        </div>

        <div
          className={`${styles.resultMessage} ${showResult ? styles.show : ""}`}
          role="alert"
          aria-live="polite"
        >
          <h1>
            <span className={styles.resultText}>Let's have</span>
            <br />
            <span className={styles.restaurantName}>{chosenRestaurant}</span>
            <br />
            <span className={styles.resultText}>tonight!</span>
          </h1>
          <div className="flex gap-4">
            <button
              className="px-4 py-2 text-white bg-red-400 rounded-md"
              onClick={() => setShowResult(false)}
            >
              Got it!
            </button>
            <button
              className="px-4 py-2 text-white bg-red-400 rounded-md"
              onClick={() => {
                deleteRestaurant(restaurants.indexOf(chosenRestaurant));
                setShowHistory(false);
              }}
            >
              Remove this restaurant
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 fixed top-0 right-0 m-4">
        {restaurants.length > 0 && (
          <div className="bg-white rounded min-w-[200px]">
            <div className="border-b border-[#ccc] p-4 flex justify-between items-center">
              <p className="text-md font-semibold">List restaurants</p>
              <p
                className="text-md font-semibold cursor-pointer"
                onClick={() => {
                  const tempRestaurants = [...restaurants];
                  for (let i = restaurants.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [tempRestaurants[i], tempRestaurants[j]] = [
                      tempRestaurants[j],
                      tempRestaurants[i],
                    ];
                  }
                  setRestaurants(tempRestaurants);
                }}
              >
                Shuffle
              </p>
            </div>
            <div className="grid max-h-[50vh] overflow-auto">
              {restaurants.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-6 p-4 border-b"
                >
                  <p className="text-sm text-gray-900">{name}</p>

                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    onClick={() => deleteRestaurant(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="form-add-restaurant relative">
          <div className="relative">
            <input
              placeholder="Search restaurant..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                debounce(() => {
                  fetchSuggesstLocation(e.target.value);
                }, 1000)();
              }}
              className="w-full p-2 border rounded"
            />
            {keyword && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => {
                  setKeyword("");
                  setShowSuggestions(false);
                }}
              >
                ✕
              </button>
            )}
          </div>
          {showSuggestions && listSuggestLocation?.length > 0 && (
            <div className="list-locations absolute w-full bg-white border mt-1 rounded shadow-lg">
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

        <div className="flex gap-2">
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
            className="px-4 py-2 bg-blue-500 text-white rounded w-full"
            onClick={() => fileInputRef.current.click()}
          >
            Import CSV
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded w-full md:right-16 lg:right-24"
            onClick={() => setShowHistory(true)}
          >
            View history
          </button>
        </div>
      </div>
    </div>
  );
}



