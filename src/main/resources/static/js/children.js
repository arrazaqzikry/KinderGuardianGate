document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("studentTableBody");
    const addForm = document.getElementById("addStudentForm");

    async function loadStudents() {
        const res = await fetch("/api/students");
        const students = await res.json();
        tableBody.innerHTML = "";

        students.forEach(s => {
            const guardians = s.guardians ? s.guardians.join(", ") : "";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.name}</td>
                <td>${s.photoUrl ? `<img src="${s.photoUrl}" width="50">` : ""}</td>
                <td>${guardians}</td>
                <td>
                    <button onclick="editStudent(${s.id})">Edit</button>
                    <button onclick="deleteStudent(${s.id}, this)">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    addForm.addEventListener("submit", async e => {
        e.preventDefault();
        const name = document.getElementById("studentName").value;
        const photo = document.getElementById("studentPhoto").value;

        await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, photoUrl: photo })
        });

        addForm.reset();
        loadStudents();
    });

    window.deleteStudent = async (id, btn) => {
        if(confirm("Delete this student?")) {
            await fetch(`/api/students/${id}`, { method: "DELETE" });
            btn.closest("tr").remove();
        }
    };

    loadStudents();
});
