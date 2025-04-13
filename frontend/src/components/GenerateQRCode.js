import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import './GenerateQRCode.css';

const GenerateQRCode = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`http://${window.location.hostname}:5000/students`);
        console.log(res.data); // Check the response data
        setStudents(res.data);
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="qr-list">
      {students.map((student) => (
        <div key={student['Student ID']} className="qr-card">
          <h4>{student.Name}</h4> {/* Use student.Name */}
          <QRCodeCanvas value={`${student['Student ID']}`} size={200} /> {/* Use student['Student ID'] */}
          <p>ID: {student['Student ID']}</p> {/* Use student['Student ID'] */}
        </div>
      ))}
    </div>
  );
};

export default GenerateQRCode;
