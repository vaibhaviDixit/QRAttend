# 📸 QR-Based Attendance System

A full-stack QR-based attendance system where students scan a QR code to mark their presence during allowed time slots. Attendance is stored in an Excel sheet.

## 🛠 Tech Stack

- **Frontend**: React.js (with `html5-qrcode`)
- **Backend**: Node.js + Express
- **Data Storage**: Excel file using `xlsx` package
- **Optional**: MySQL or MongoDB (for future upgrades)



## ⚙️ Backend Setup

1. Navigate to backend:
   ```bash
   cd backend

2. Install dependencies:
   ```bash
   npm install

3. Create an Excel file named attendance.xlsx:

    Sheet name: Sheet1

    Columns: Student Name, Student ID, Present

4. Start backend server:
   ```bash
   node server.js
   
  Server runs at: http://localhost:5000


## Prerequisites

1. You should have students.xlsx file (path: backend/) whih contains students data in columns "Student ID" and "Name". 
   ( DO NOT MODIFY COLUMN NAMES, KEEP IT AS IT IS )

## 🌐 Frontend Setup

1. Navigate to frontend:
    ```bash
    cd ../frontend

2. Install dependencies:
   ```bash
   npm install
   
4. Start frontend app:
   ```bash
   npm start
   
  App runs at: http://localhost:3000
  
  
## 🛡 Common Issues & Fixes



### 📹 Scanner Not Opening
* If you are facing issues with the scanner not opening, especially with a local development server, you might need to adjust Chrome settings.
* **Fix:** Head over to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`. In the text box, add your local development URL (e.g., `http://192.168.250.112:3000`) and enable the flag. This allows Chrome to treat the specified insecure origin as secure for testing purposes.


### 🎥 Double Camera View
* **Ensure Html5QrcodeScanner is initialized only once.** Avoid creating multiple instances of the scanner.
* **Always clear `#reader` div before reinitializing.** If you need to restart the scanner, make sure to empty the container element first.

### ⛔ Cannot Stop Scanner Error
* **Scanner is already stopped or wasn't running.** Verify the scanner's state before attempting to stop it.
* **Use `try/catch` around `.stop()`**. Implement error handling to gracefully manage potential issues during the stopping process.
* **Check scanner state before stopping.** Ensure the scanner is actively running before calling the `.stop()` method.

### 📄 Excel Not Updating
* **Make sure the Excel file is not open while running the app.** The application may not be able to write to the file if it's currently open in another program.

### 🚫 Multiple Scans or Alerts
* **Use `scanning.current = true` ref to throttle scanning.** Employ a flag to control whether a scan is currently in progress.
* **Add a delay (`setTimeout`) before allowing the next scan.** Introduce a short pause after each successful scan to prevent rapid, unintended triggers.

## ✅ Tips

* **Use different devices for QR code display and scan.** This eliminates potential issues with camera angles or screen glare.
* **Use `console.log(result.text)` to debug scanned output.** This helps in verifying that the scanner is correctly reading the QR code data.
* **Always verify your POST URL matches the backend server.** Ensure the data is being sent to the correct endpoint.

## 🧪 Future Improvements

* **Login system for students and QR generation.** Implement user authentication and the ability for students to generate their own QR codes.
* **Admin dashboard with downloadable reports.** Create an administrative interface for managing data and exporting reports.
* **Auto date-based Excel file creation.** Automatically generate new Excel files based on the current date.
* **Database integration instead of Excel.** Transition from Excel to a more robust database system for data storage and management.
   



























