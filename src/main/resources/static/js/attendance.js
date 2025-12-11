const API_URL = '/api/attendance';
const tableBody = document.getElementById('attendanceTableBody');

// Global flag to track editability state
let isEditable = true;

// Load today's attendance data
async function loadAttendanceData() {
    try {
        const response = await fetch(`${API_URL}/today`);
        if (!response.ok) throw new Error('Failed to fetch attendance data');

        const students = await response.json();

        // Determine initial state: if any record exists, assume it was submitted once
        const wasSubmitted = students.some(
            s => s.status === 'PRESENT' || s.status === 'ABSENT'
        );

        renderAttendanceTable(students, wasSubmitted);
    } catch (error) {
        console.error("Error loading attendance:", error);
        alert("Failed to load attendance list. See console for details.");
    }
}

// Update the Submit/Edit buttons based on submission state
function updateControlButtons(wasSubmitted) {
    const submitBtn = document.getElementById('submitAttendanceBtn');
    const editBtn = document.getElementById('editAttendanceBtn');

    if (!submitBtn || !editBtn) return; // Safety check

    if (wasSubmitted) {
        // Attendance exists: Start in read-only mode, show Edit button
        isEditable = false;
        submitBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';
    } else {
        // First time submission OR editing is active: Start in editable mode
        isEditable = true;
        submitBtn.style.display = 'inline-block';
        editBtn.style.display = 'none';
    }
}

// Enable editing when Edit button is clicked
window.enableEditing = function() {
    isEditable = true;
    updateControlButtons(false); // Switch to submit mode

    // Remove status color from all rows
    tableBody.querySelectorAll('tr').forEach(row => {
        row.classList.remove('status-present', 'status-absent');
    });

    // Enable all radio buttons for editing
    tableBody.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.disabled = false;
    });
};

// Render the attendance table
function renderAttendanceTable(students, wasSubmitted) {
    tableBody.innerHTML = '';

    // Set initial edit state and button visibility
    updateControlButtons(wasSubmitted);

    if (students.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No student records found.</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = tableBody.insertRow();
        row.dataset.studentId = student.id;

        row.insertCell().textContent = student.id;
        row.insertCell().textContent = student.name;

        const statusLabel = student.status ? student.status.toUpperCase() : '';

        // Determine the disabled state based on the current 'isEditable' flag
        const isDisabled = wasSubmitted && !isEditable ? 'disabled' : '';

        // Apply color if the attendance has been submitted (read-only mode)
        if (wasSubmitted && !isEditable) {
            if (statusLabel === 'PRESENT') row.classList.add('status-present');
            else if (statusLabel === 'ABSENT') row.classList.add('status-absent');
        }

        const presentCell = row.insertCell();
        presentCell.className = 'status-cell';
        presentCell.innerHTML = `
            <input type="radio" name="status_${student.id}" value="PRESENT" 
            ${statusLabel === 'PRESENT' ? 'checked' : ''} ${isDisabled}>
        `;

        const absentCell = row.insertCell();
        absentCell.className = 'status-cell';
        absentCell.innerHTML = `
            <input type="radio" name="status_${student.id}" value="ABSENT" 
            ${statusLabel !== 'PRESENT' ? 'checked' : ''} ${isDisabled}>
        `;
    });
}

// Save attendance data
async function saveAttendance() {
    if (!isEditable) {
        alert('Please click "Edit Attendance" before saving changes.');
        return;
    }

    const attendanceData = [];
    tableBody.querySelectorAll('tr').forEach(row => {
        const studentId = row.dataset.studentId;
        const checkedRadio = row.querySelector(`input[name="status_${studentId}"]:checked`);
        if (checkedRadio) {
            attendanceData.push({
                studentId: parseInt(studentId),
                status: checkedRadio.value
            });
        }
    });

    if (attendanceData.length === 0) {
        alert('No attendance data selected to submit.');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendanceData)
        });

        if (response.ok) {
            alert('Attendance log saved successfully! Switching to read-only mode.');
            loadAttendanceData(); // Reloads data to switch buttons and disable inputs
        } else {
            const errorText = await response.text();
            alert(`Failed to save attendance log. Server response: ${errorText}`);
        }
    } catch (error) {
        console.error("Error submitting attendance:", error);
        alert("An error occurred during submission.");
    }
}

// Expose functions globally
window.saveAttendance = saveAttendance;
window.enableEditing = enableEditing;

// Initialize
document.addEventListener('DOMContentLoaded', loadAttendanceData);
