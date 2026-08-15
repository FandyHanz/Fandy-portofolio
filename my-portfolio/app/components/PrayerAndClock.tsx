"use client";

import { useEffect, useState } from "react";

export default function PrayerAndClock() {
  // Clock State
  const [time, setTime] = useState({ hours: "00", minutes: "00", seconds: "00" });

  // Prayer Times State
  const [currentDate, setCurrentDate] = useState("--");
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: "--:--",
    dhuhr: "--:--",
    asr: "--:--",
    maghrib: "--:--",
    isha: "--:--",
  });

  useEffect(() => {
    // 1. UPDATE CLOCK REALTIME
    const updateClock = () => {
      const now = new Date();
      setTime({
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(now.getMinutes()).padStart(2, "0"),
        seconds: String(now.getSeconds()).padStart(2, "0"),
      });
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // 2. HITUNG PRAYER TIME DARI PrayerTime.js
    const loadPrayerTimes = () => {
      const win = window as any;
      if (typeof win.prayTimes !== "undefined") {
        const latitude = -7.9839;
        const longitude = 112.6214;
        const timeZone = 7;

        try {
          win.prayTimes.setMethod("Kemenag");
        } catch {
          // Fallback method jika string kemenag tidak didukung
          win.prayTimes.setMethod("MWL");
        }

        const today = new Date();
        const times = win.prayTimes.getTimes(today, [latitude, longitude], timeZone);

        const options: Intl.DateTimeFormatOptions = {
          day: "numeric",
          month: "long",
          year: "numeric",
        };
        setCurrentDate(today.toLocaleDateString("en-GB", options));

        setPrayerTimes({
          fajr: times.fajr || "--:--",
          dhuhr: times.dhuhr || "--:--",
          asr: times.asr || "--:--",
          maghrib: times.maghrib || "--:--",
          isha: times.isha || "--:--",
        });
      }
    };

    // Panggil saat script selesai load
    loadPrayerTimes();
    const timer = setTimeout(loadPrayerTimes, 300);

    return () => {
      clearInterval(clockInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* DIGITAL CLOCK */}
      <div className="container-fluid">
        <h1 className="h2 mb-4 fw-bold">Time:</h1>
        <div className="digital-clock-container">
          <span>{time.hours}</span>
          <span className="clock-separator">:</span>
          <span>{time.minutes}</span>
          <span className="clock-separator">:</span>
          <span>{time.seconds}</span>
        </div>
      </div>

      <hr className="text-white-50 my-5" />

      {/* PRAYER TIME */}
      <div className="container-fluid">
        <h1 className="h2 mb-4 fw-bold">Prayer Time:</h1>
        <div className="prayer-schedule-container">
          <div className="header">
            <div className="date-location">
              <span>Malang</span>, <span>{currentDate}</span>
            </div>
          </div>
          <div className="prayer-times">
            <div className="prayer-time-item">
              <div className="prayer-name">Subuh</div>
              <div className="time">{prayerTimes.fajr}</div>
            </div>
            <div className="prayer-time-item">
              <div className="prayer-name">Dzuhur</div>
              <div className="time">{prayerTimes.dhuhr}</div>
            </div>
            <div className="prayer-time-item">
              <div className="prayer-name">Ashar</div>
              <div className="time">{prayerTimes.asr}</div>
            </div>
            <div className="prayer-time-item">
              <div className="prayer-name">Maghrib</div>
              <div className="time">{prayerTimes.maghrib}</div>
            </div>
            <div className="prayer-time-item">
              <div className="prayer-name">Isha</div>
              <div className="time">{prayerTimes.isha}</div>
            </div>
          </div>
        </div>
        <br />
        <p className="text-white-50 small">* Might not accurately just reminder</p>
      </div>
    </>
  );
}