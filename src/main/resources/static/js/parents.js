document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("guardianTableBody");
    const addForm = document.getElementById("addGuardianForm");

    // Load guardians and their children
    async function loadGuardians() {
        const res = await fetch("/api/guardians");
        const guardians = await res.json();
        tableBody.innerHTML = "";

        guardians.forEach(g => {
            const childrenNames = g.students ? g.students.join(", ") : "";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${g.name}</td>
                <td>${g.icNumber}</td>
                <td>${g.photoUrl ? `<img src="${g.photoUrl}" width="50">` : ""}</td>
                <td>${childrenNames}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editGuardian(${g.id})">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteGuardian(${g.id}, this)">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Generic modern message modal
    function showMessageModal(message, type = "info", onConfirm = null) {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";

        const box = document.createElement("div");
        box.className = "modal-box";

        const icon = type === "success" ? "✅" : type === "warning" ? "⚠️" : "ℹ️";

        box.innerHTML = `
            <h3 style="margin-bottom: 15px;">${icon} ${message}</h3>
            <div class="modal-buttons">
                ${onConfirm ? '<button class="save-btn">Yes</button>' : ''}
                <button class="cancel-btn">${onConfirm ? 'No' : 'Close'}</button>
            </div>
        `;

        modal.appendChild(box);
        document.body.appendChild(modal);

        if (onConfirm) {
            box.querySelector(".save-btn").onclick = () => {
                onConfirm();
                modal.remove();
            };
        }

        box.querySelector(".cancel-btn").onclick = () => modal.remove();
    }

    // Add new guardian
    addForm.addEventListener("submit", async e => {
        e.preventDefault();

        const name = document.getElementById("guardianName").value;
        const icNumber = document.getElementById("guardianIc").value;
        const photoUrl = document.getElementById("guardianPhoto").value;

        await fetch("/api/guardians", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, icNumber, photoUrl })
        });

        addForm.reset();
        loadGuardians();

        showMessageModal("Guardian added successfully!", "success");
    });

    // Create modal for assigning children
    function createModal() {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";

        const box = document.createElement("div");
        box.className = "modal-box";

        modal.appendChild(box);
        document.body.appendChild(modal);

        return { modal, box };
    }

    // Edit guardian – assign children
    window.editGuardian = async function (id) {
        const res = await fetch("/api/students");
        const students = await res.json();

        const { modal, box } = createModal();
        box.innerHTML = `<h2>Assign Children</h2>`;

        students.forEach(s => {
            const label = document.createElement("label");
            label.className = "checkbox-line";
            label.innerHTML = `<input type="checkbox" value="${s.id}"> ${s.name}`;
            box.appendChild(label);
        });

        const btnRow = document.createElement("div");
        btnRow.className = "modal-buttons";
        btnRow.innerHTML = `
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        `;
        box.appendChild(btnRow);

        // Save
        box.querySelector(".save-btn").onclick = async () => {
            const selectedIds = Array.from(
                box.querySelectorAll("input[type='checkbox']:checked")
            ).map(cb => parseInt(cb.value));

            await fetch(`/api/guardians/${id}/students`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentIds: selectedIds })
            });

            modal.remove();
            loadGuardians();

            showMessageModal("Children assigned successfully!", "success");
        };

        // Cancel
        box.querySelector(".cancel-btn").onclick = () => modal.remove();
    };

    // Delete guardian
    window.deleteGuardian = async function (id, btn) {
        showMessageModal("Are you sure you want to delete this guardian?", "warning", async () => {
            await fetch(`/api/guardians/${id}`, { method: "DELETE" });
            btn.closest("tr").remove();
            showMessageModal("Guardian deleted successfully!", "success");
        });
    };

    loadGuardians();
});
