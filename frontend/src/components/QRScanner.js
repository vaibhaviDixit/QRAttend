import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';

const QRScanner = () => {
  const [lastScanned, setLastScanned] = useState('');
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const scannerStarted = useRef(false);

  useEffect(() => {
    const startScanner = async () => {
      if (scannerStarted.current || scannerRef.current) return;

      try {
        const readerElem = document.getElementById('reader');
        if (!readerElem) {
          console.error("Reader element not found.");
          return;
        }
        readerElem.innerHTML = '';

        scannerRef.current = new Html5Qrcode('reader', {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });

        const devices = await Html5Qrcode.getCameras();
        let cameraConfig;

        if (devices && devices.length > 0) {
          const backCam = devices.find(d => d.label.toLowerCase().includes('back'));
          cameraConfig = { deviceId: { exact: backCam ? backCam.id : devices[0].id } };
        } else {
          cameraConfig = { facingMode: 'environment' };
        }

        await scannerRef.current.start(
          cameraConfig,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (isScanning.current) return;
            isScanning.current = true;
            setLastScanned(decodedText);

            // Get user geolocation
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                  const res = await axios.post( `http://${window.location.hostname}:5000/mark-attendance`, {
                    studentId: decodedText,
                    location: { latitude, longitude }
                  });
                  alert(res.data.message);
                } catch (err) {
                  alert(err.response?.data?.message || 'Scan failed.');
                } finally {
                  setTimeout(() => { isScanning.current = false }, 3000);
                }
              },
              (error) => {
                alert('Location access denied. Please enable location to mark attendance.');
                isScanning.current = false;
              }
            );
          },
          (err) => {
            console.warn('QR scan error:', err);
          }
        );

        scannerStarted.current = true;
      } catch (error) {
        console.error("Error starting scanner:", error);
        alert('Could not start the scanner.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerStarted.current) {
        scannerRef.current.stop().then(() => {
          return scannerRef.current.clear();
        }).then(() => {
          scannerRef.current = null;
          scannerStarted.current = false;
        }).catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Scan Student QR</h3>
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}></div>
      {lastScanned && <p>Last Scanned: <strong>{lastScanned}</strong></p>}
    </div>
  );
};

export default QRScanner;
