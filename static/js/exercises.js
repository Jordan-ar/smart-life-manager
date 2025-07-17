document.addEventListener("DOMContentLoaded", () => {
	const exerciseList = document.getElementById("exercise-list");
	const modal = document.getElementById("exercise-modal");
	const modalTitle = document.getElementById("modal-exercise-name");
	const modalImage = document.getElementById("modal-exercise-image");
	const modalTarget = document.getElementById("modal-exercise-target");
	const modalEquipment = document.getElementById("modal-exercise-equipment");
	const modalReps = document.getElementById("modal-exercise-reps");
	const modalDesc = document.getElementById("modal-exercise-description");
	const closeBtn = document.querySelector(".close-modal");

	fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json")
		.then(res => res.json())
		.then(data => {
			const previewList = document.getElementById("exercise-preview-list");
			console.log("Total exercises in dataset:", data.length);
			data.slice(0, 50).forEach(ex => {
				const card = document.createElement("div");
				card.classList.add("exercise-preview-card");

				card.innerHTML = `
        <img src="${ex.image || '/static/assets/default.jpg'}" alt="${ex.name}">
        <div class="exercise-preview-info">
          <h3>${ex.name || "Unnamed"}</h3>
          <p><strong>Target:</strong> ${ex.primaryMuscles?.join(", ") || "N/A"}</p>
          <p><strong>Equipment:</strong> ${ex.equipment || "N/A"}</p>
          <p><strong>Reps:</strong> 10</p>
          <p><strong>Instructions:</strong> ${ex.instructions || "No instructions available."}</p>
        </div>
      `;

				previewList.appendChild(card);
			});
		})
		.catch(err => {
			console.error("Error al cargar los ejercicios:", err);
		});

	closeBtn.addEventListener("click", () => {
		modal.classList.remove("show");
	});
});
