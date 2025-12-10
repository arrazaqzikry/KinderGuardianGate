document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("guardianTableBody");
    const addForm = document.getElementById("addGuardianForm");

    // Load guardians and their children
    async function loadGuardians() {
        const res = await fetch("/api/guardians");
        const guardians = await res.json();
        tableBody.innerHTML = "";

        guardians.forEach(g => {
            const row = document.createElement("tr");
            const childrenNames = g.students ? g.students.join(", ") : "";

            row.innerHTML = `
                <td>${g.name}</td>
                <td>${g.icNumber}</td>
                <td>${g.photoUrl ? `<img src="${g.photoUrl}" width="50">` : ""}</td>
                <td>${childrenNames}</td>
                <td>
                    <button onclick="editGuardian(${g.id})">Edit</button>
                    <button onclick="deleteGuardian(${g.id}, this)">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Add new guardian
    addForm.addEventListener("submit", async e => {
        e.preventDefault();
        const name = document.getElementById("guardianName").value;
        const ic = document.getElementById("guardianIc").value;
        const photo = document.getElementById("guardianPhoto").value;

        await fetch("/api/guardians", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, icNumber: ic, photoUrl: photo })
        });

        addForm.reset();
        loadGuardians();
    });

    // Edit guardian: assign children
    window.editGuardian = async function(id) {
        const res = await fetch("/api/students");
        const students = await res.json();

        // Create modal
        const modal = document.createElement("div");
        Object.assign(modal.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000"
        });

        const box = document.createElement("div");
        Object.assign(box.style, {
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            maxHeight: "80%",
            overflowY: "auto"
        });

        box.innerHTML = `<h3>Assign Children</h3>`;

        students.forEach(s => {
            const label = document.createElement("label");
            label.style.display = "block";
            label.style.marginBottom = "5px";
            label.innerHTML = `<input type="checkbox" value="${s.id}"> ${s.name}`;
            box.appendChild(label);
        });

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.style.marginTop = "10px";
        saveBtn.onclick = async () => {
            const selectedIds = Array.from(box.querySelectorAll("input:checked"))
                .map(cb => parseInt(cb.value));

            await fetch(`/api/guardians/${id}/students`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentIds: selectedIds })
            });

            document.body.removeChild(modal);
            await loadGuardians(); // refresh table
        };

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.marginLeft = "10px";
        cancelBtn.onclick = () => document.body.removeChild(modal);

        box.appendChild(saveBtn);
        box.appendChild(cancelBtn);
        modal.appendChild(box);
        document.body.appendChild(modal);
    };

    // Delete guardian
    window.deleteGuardian = async function(id, btn) {
        if(confirm("Are you sure you want to delete this guardian?")) {
            await fetch(`/api/guardians/${id}`, { method: "DELETE" });
            btn.closest("tr").remove();
        }
    }

    window.logout = function() {
        alert("Logging out...");
    }

    loadGuardians();
});
