import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

const QRScanner = () => {
  const [lastScanned, setLastScanned] = useState('');
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const scannerStarted = useRef(false);

  // Valid time slot checker
  const isWithinValidTimeSlot = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const timeSlots = [
      { start: [9, 0], end: [9, 15] },
      { start: [10, 0], end: [10, 15] },
      { start: [11, 15], end: [11, 30] },
      { start: [12, 15], end: [12, 30] },
      { start: [14, 0], end: [16, 0] }, // 2:00 PM to 4:00 PM
    ];

    return timeSlots.some(({ start, end }) => {
      const startTime = start[0] * 60 + start[1];
      const endTime = end[0] * 60 + end[1];
      return currentTime >= startTime && currentTime <= endTime;
    });
  };

  useEffect(() => {
    const startScanner = async () => {
      if (scannerStarted.current) return; // Prevent duplicate init

      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || !devices.length) {
          console.error('No cameras found');
          return;
        }

        const cameraId = devices[0].id;

        // Clear reader div before init
        const readerElem = document.getElementById('reader');
        if (readerElem) readerElem.innerHTML = '';

        // Initialize scanner only once
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode('reader');
        }

        await scannerRef.current.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          async (decodedText) => {
            if (isScanning.current) return;

            if (!isWithinValidTimeSlot()) {
              alert('You are outside the allowed attendance time.');
              return;
            }

            isScanning.current = true;
            console.log('Scanned:', decodedText);
            setLastScanned(decodedText);

            try {
              const res = await axios.post('http://localhost:5000/mark-attendance', {
                studentId: decodedText,
              });
              alert(res.data.message);
            } catch (err) {
              alert('Failed to mark attendance.');
              console.error(err);
            } finally {
              setTimeout(() => {
                isScanning.current = false;
              }, 3000); // 3-second cooldown
            }
          },
          (err) => {
            console.warn('Scan error:', err);
          }
        );

        scannerStarted.current = true;
      } catch (err) {
        console.error('Error initializing scanner:', err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerStarted.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            scannerStarted.current = false;
            scannerRef.current = null;
          })
          .catch((err) => console.error('Stop/clear error:', err));
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <h3>Scan Student QR Code</h3>
      <div
        id="reader"
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '300px',
          margin: 'auto',
          borderRadius: '8px',
          border: '1px solid #ccc',
          overflow: 'hidden',
        }}
      ></div>

      {lastScanned && (
        <p style={{ marginTop: '1rem' }}>
          Last scanned ID: <strong>{lastScanned}</strong>
        </p>
      )}
    </div>
  );
};

export default QRScanner;
