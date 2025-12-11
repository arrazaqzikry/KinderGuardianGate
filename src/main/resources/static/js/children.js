document.addEventListener("DOMContentLoaded", () => {
    const studentTableBody = document.getElementById("studentTableBody");
    const addStudentForm = document.getElementById("addStudentForm");

    // Generic modal
    function showMessageModal(message, type="info", onConfirm=null) {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        const box = document.createElement("div");
        box.className = "modal-box";

        const icon = type==="success"?"✅":type==="warning"?"⚠️":"ℹ️";
        box.innerHTML = `
            <h3 style="margin-bottom:15px;">${icon} ${message}</h3>
            <div class="modal-buttons">
                ${onConfirm?'<button class="save-btn">Yes</button>':''}
                <button class="cancel-btn">${onConfirm?'No':'Close'}</button>
            </div>
        `;
        modal.appendChild(box);
        document.body.appendChild(modal);

        if(onConfirm){
            box.querySelector(".save-btn").onclick = () => { onConfirm(); modal.remove(); };
        }
        box.querySelector(".cancel-btn").onclick = () => modal.remove();
    }

    // Load students from API
    async function loadStudents() {
        const res = await fetch("/api/students");
        const students = await res.json();
        studentTableBody.innerHTML = "";

        students.forEach(s => {
            const guardians = s.guardians ? s.guardians.join(", ") : "";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${s.name}</td>
                <td>${s.photoUrl?`<img src="${s.photoUrl}" width="50">`:""}</td>
                <td>${guardians}</td>
                <td>
                    <button class="action-btn edit-btn"><i class="bi bi-pencil-fill"></i></button>
                    <button class="action-btn delete-btn"><i class="bi bi-trash-fill"></i></button>
                </td>
            `;

            // Edit
            row.querySelector(".edit-btn").onclick = () => editStudent(s, row);
            // Delete
            row.querySelector(".delete-btn").onclick = () => {
                showMessageModal("Delete this child?", "warning", async () => {
                    await fetch(`/api/students/${s.id}`, {method:"DELETE"});
                    row.remove();
                    showMessageModal("Child deleted successfully!", "success");
                });
            };

            studentTableBody.appendChild(row);
        });
    }

    // Add student
    addStudentForm.addEventListener("submit", async e => {
        e.preventDefault();
        const name = document.getElementById("studentName").value;
        const photo = document.getElementById("studentPhoto").value;

        await fetch("/api/students", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({name, photoUrl: photo})
        });

        addStudentForm.reset();
        loadStudents();
        showMessageModal("Child added successfully!", "success");
    });

    // Edit student modal
    async function editStudent(student, row) {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        const box = document.createElement("div");
        box.className = "modal-box";
        modal.appendChild(box);
        document.body.appendChild(modal);

        box.innerHTML = `
            <h3>Edit Child</h3>
            <small>Change name</small>
            <input type="text" id="editName" value="${student.name}">
            <small>Change Photo URL</small>
            <input type="text" id="editPhoto" value="${student.photoUrl||''}">
            <div class="modal-buttons">
                <button class="save-btn">Save</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        box.querySelector(".save-btn").onclick = async () => {
            const newName = box.querySelector("#editName").value;
            const newPhoto = box.querySelector("#editPhoto").value;

            await fetch(`/api/students/${student.id}`, {
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({name:newName, photoUrl:newPhoto})
            });

            row.children[0].textContent = newName;
            row.children[1].innerHTML = newPhoto ? `<img src="${newPhoto}" width="50">` : "";
            modal.remove();
            showMessageModal("Child updated successfully!", "success");
        };

        box.querySelector(".cancel-btn").onclick = () => modal.remove();
        modal.addEventListener("click", (e) => { if(e.target===modal) modal.remove(); });
    }

    loadStudents();
});
