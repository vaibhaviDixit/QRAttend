
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './GenerateQRCode.css';

const students = [
  { id: 'S001', name: 'Anaya Patil' },
  { id: 'S002', name: 'Benny Dayal' },
  { id: 'S003', name: 'Charlie Patel' },
  { id: 'S004', name: 'Divya Mehta' },
];

const GenerateQRCode = () => {
  return (
    <div className="qr-list">
      {students.map((student) => (
        <div key={student.id} className="qr-card">
          <h4>{student.name}</h4>
          <QRCodeCanvas value={student.id} size={200} />
          <p>ID: {student.id}</p>
        </div>
      ))}
    </div>
  );
};

export default GenerateQRCode;
