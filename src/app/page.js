"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./randomwheel.module.css";
import axios from "axios";
import HistoryDialog from "./components/HistoryDialog";
import * as XLSX from 'xlsx';
import Search from "./components/Search";
import ListRestaurant from "./components/ListRestaurant";
import ImportCSV from "./components/ImportCSV";
import { Header } from "./components/SideBar";

const initialRestaurants = [];

const API_KEY = "xYMZRYtUiOGz90R5Lt3z7uAAJWaZb22L3hv4SKWs";

export default function RandomWheel() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [restaurants, setRestaurants] = useState([]);
  const [chosenRestaurant, setChosenRestaurant] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
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

  const handleChangeSearch = (e) => {
    setKeyword(e.target.value);
    debounce(() => {
      fetchSuggesstLocation(e.target.value);
    }, 1000)();
  }

  const handleClearSearch = () => {
    setKeyword("");
    setShowSuggestions(false);
  }

  const handleClickImportFile = () => {
    fileInputRef.current.click()
  }

  return (
    <>
      <Header>
        <div className="flex flex-col md:flex-row md:w-full items-center gap-2 mb-2">
          <Search handleChangeSearch={handleChangeSearch} handleClearSearch={handleClearSearch} keyword={keyword} showSuggestions={showSuggestions} listSuggestLocation={listSuggestLocation} addRestaurant={addRestaurant} />
          {restaurants.length > 0 && (
            <ListRestaurant restaurants={restaurants} deleteRestaurant={deleteRestaurant} setRestaurants={setRestaurants} />
          )}
        </div>
        <div className="flex flex-col gap-4 justify-center md:flex-row">
          <ImportCSV fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} handleClickImportFile={handleClickImportFile} />
          <button
            className="w-max px-2 py-2 bg-gray-500 text-white rounded md:right-16 lg:right-24"
            onClick={() => setShowHistory(true)}
          >
            View history
          </button>
        </div>
      </Header>
      <div className={`${styles.body}`}>

        <div className="flex justify-center items-center flex-col">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400 mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-4xl lg:text-5xl dark:text-white">Restaurants Random Wheel</h1>
          <div className="font-extrabold text-gray-500 dark:text-gray-400 text-xl">Please choose your restaurant and I will give you a decision!</div>
        </div>
        <div className="relative flex items-center justify-center gap-10 px-4 md:px-16 lg:px-24 max-xl:flex-col-reverse w-full">
          <HistoryDialog
            open={showHistory}
            setOpen={setShowHistory}
            history={history}
            removeHistory={(idx) => removeHistory(idx)}
            removeAll={removeAllHistory}
          />

          <div className="gap-10 max-xl:flex-col">
            <div className={`${styles.wheelContainer}`}>
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
                  setShowResult(false)
                }}
              >
                Remove this restaurant
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



