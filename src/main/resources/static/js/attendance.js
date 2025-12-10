async function loadStudents() {
    try {
        const res = await fetch('/api/students');
        const students = await res.json();

        const tbody = document.querySelector('#studentTable tbody');
        tbody.innerHTML = '';

        if (!students.length) {
            tbody.innerHTML = '<tr><td colspan="6">No students found</td></tr>';
            return;
        }

        students.forEach((s, i) => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${i + 1}</td>
                <td style="text-align: center;">
                    <input type="checkbox" onchange="markPresent(this)">
                </td>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.className || '-'}</td>
                <td>${s.qrCode || '-'}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (e) {
        alert('❌ Failed to load students from H2');
        console.error(e);
    }
}

function markPresent(checkbox) {
    const row = checkbox.closest('tr');
    if (checkbox.checked) {
        row.classList.add('present');
    } else {
        row.classList.remove('present');
    }
}

// Auto load when open page
loadStudents();
