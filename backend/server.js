const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const excelFilePath = path.join(__dirname, 'attendance.xlsx');

// Time slots to allow attendance marking
// Format: { start: 'HH:mm', end: 'HH:mm' }

const timeSlots = [
  { start: '09:00', end: '09:15' },
  { start: '10:00', end: '10:15' },
  { start: '11:15', end: '11:30' },
  { start: '12:15', end: '12:30' },
  { start: '14:00', end: '16:00' },
];

// Function to check if current time is within valid time slots
const isValidTime = () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // Get time in HH:mm format

  for (const slot of timeSlots) {
    console.log(slot.start+"---"+currentTime);
    if (currentTime >= slot.start && currentTime <= slot.end) {
      return true;
    }
  }
  return false;
};

// Ensure the Excel file exists
if (!fs.existsSync(excelFilePath)) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['Student ID', 'Date', 'Time']]);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, excelFilePath);
}

app.post('/mark-attendance', (req, res) => {
  const { studentId } = req.body;

  // Check if time is valid
  if (!isValidTime()) {
    return res.status(400).json({ message: 'Attendance can only be marked within allowed time slots.' });
  }

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required.' });
  }

  const wb = XLSX.readFile(excelFilePath);
  const ws = wb.Sheets['Attendance'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const now = new Date();
  const date = now.toLocaleDateString('en-IN');
  const time = now.toLocaleTimeString('en-IN');

  data.push([studentId, date, time]);

  const newWs = XLSX.utils.aoa_to_sheet(data);
  wb.Sheets['Attendance'] = newWs;
  XLSX.writeFile(wb, excelFilePath);

  res.json({ message: 'Attendance marked successfully.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
