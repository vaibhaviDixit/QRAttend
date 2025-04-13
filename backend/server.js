const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Paths
const studentsFilePath = path.join(__dirname, 'students.xlsx');
const attendanceDir = path.join(__dirname, 'attendance');
const configFilePath = path.join(__dirname, 'config.json'); // For dynamic geolocation

// Make sure attendance folder exists
if (!fs.existsSync(attendanceDir)) {
  fs.mkdirSync(attendanceDir);
}

// Utility: Get current time slot
function getCurrentTimeSlot() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const current = hours * 60 + minutes;

  const slots = [
    { label: 'Slot 1', start: [9, 0], end: [9, 15] },
    { label: 'Slot 2', start: [10, 0], end: [10, 15] },
    { label: 'Slot 3', start: [11, 15], end: [11, 30] },
    { label: 'Slot 4', start: [12, 15], end: [12, 30] },
    { label: 'Slot 5', start: [14, 0], end: [16, 0] },
  ];

  for (const slot of slots) {
    const start = slot.start[0] * 60 + slot.start[1];
    const end = slot.end[0] * 60 + slot.end[1];
    if (current >= start && current <= end) return slot.label;
  }

  return null;
}

// Utility: Location check
function isWithinAllowedLocation(lat1, lon1, lat2, lon2, radius) {
  function toRad(value) {
    return value * Math.PI / 180;
  }

  const R = 6371e3; // Radius of Earth in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radius;
}

// Read classroom geolocation from config file (dynamic)
function getClassroomLocation() {
  if (fs.existsSync(configFilePath)) {
    const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    return config.classroomLocation || { latitude: 28.7041, longitude: 77.1025 };  // Default if not found
  }
  return { latitude: 28.7041, longitude: 77.1025 };  // Default fallback
}

// Read students from Excel
function readStudents() {
  const workbook = xlsx.readFile(studentsFilePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return data; // Expected columns: "Student ID", "Name"
}

// Teacher Authentication (for /qr)
function verifyTeacherToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err || decoded.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Only teachers can access this' });
    }
    req.user = decoded;  // Attach user info for further use
    next();
  });
}

// Endpoint: Get students
app.get('/students', (req, res) => {
  try {
    const students = readStudents();
    res.json(students);
  } catch (err) {
    console.error('Error reading students:', err);
    res.status(500).send('Error loading student data.');
  }
});

// Endpoint: Mark attendance (with geolocation)
app.post('/mark-attendance', (req, res) => {
  const { studentId, location } = req.body;
  const slot = getCurrentTimeSlot();

  if (!slot) {
    return res.status(400).json({ message: 'Outside allowed attendance slots.' });
  }

  if (!location || !location.latitude || !location.longitude) {
    return res.status(400).json({ message: 'Location data is required.' });
  }

  const classroomLocation = getClassroomLocation();

  const isInClass = isWithinAllowedLocation(
    location.latitude,
    location.longitude,
    classroomLocation.latitude,
    classroomLocation.longitude,
    50  // 50 meters radius
  );

  if (!isInClass) {
    return res.status(403).json({ message: 'You are not within the allowed class location.' });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `attendance_${today}.xlsx`;
  const attendancePath = path.join(attendanceDir, filename);

  const students = readStudents();
  const student = students.find((s) => s['Student ID'] === studentId);

  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  let attendanceData = [];
  let sheetExists = false;

  if (fs.existsSync(attendancePath)) {
    const workbook = xlsx.readFile(attendancePath);
    const sheetName = 'Attendance';
    const worksheet = workbook.Sheets[sheetName];
    attendanceData = xlsx.utils.sheet_to_json(worksheet);
    sheetExists = true;
  }

  const alreadyMarked = attendanceData.find(
    (entry) => entry['Student ID'] === studentId && entry.Slot === slot
  );

  if (alreadyMarked) {
    return res.status(400).json({ message: `Already marked in ${slot}` });
  }

  const now = new Date();
  attendanceData.push({
    'Student ID': studentId,
    Name: student.Name,
    Slot: slot,
    Time: now.toLocaleTimeString(),
  });

  const worksheet = xlsx.utils.json_to_sheet(attendanceData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  xlsx.writeFile(workbook, attendancePath);

  res.json({ message: `Attendance marked for ${student.Name} in ${slot}` });
});

// Endpoint: QR Page - Teacher only access
app.get('/qr', verifyTeacherToken, (req, res) => {
  res.send('QR Page: Only accessible by teachers');
});

// Authentication Endpoint for Teachers (simple login simulation)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple example - ideally, you should validate credentials against a database
  if (username === 'teacher' && password === 'password') {
    const token = jwt.sign({ role: 'teacher', username }, 'secret_key', { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
