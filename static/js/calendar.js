const days = document.querySelectorAll(".day-circle");
const subtitle = document.getElementById("plan-subtitle");
const dayCard = document.getElementById("day-card");
const exerciseTitle = document.querySelector(".exercise-title");

// Create week calendar
const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayName = dayMap[new Date().getDay()];

// Highlight today
days.forEach(day => {
	if (day.dataset.day === todayName) {
		day.classList.add("today");
		day.classList.add("active");
	}
});

// Routine Plan.
const routines = formatRoutine(aiRoutine);

// Set subtitle dynamically based on routine
const planType = aiRoutine[0]?.type || "Workout";
subtitle.textContent = `${planType} · Week 1`;

// Create a quick lookup for reps from AI routine
const exerciseRepsMap = {};
aiRoutine.forEach(day => {
	day.exercises.forEach(ex => {
		if (ex.name && ex.reps) {
			exerciseRepsMap[ex.name.toLowerCase()] = ex.reps;
		}
	});
});

// Exercise details.
function getExerciseDetailsByName(name) {
	for (let category of exerciseList) {
		for (let exercise of category.exercises) {
			if (exercise.name.toLowerCase() === name.toLowerCase()) {
				return {
					description: exercise.description || "No description available.",
					reps: exercise.reps || "N/A",
					image: exercise.gifUrl || "#",
					target: exercise.target || "Unknown",
					equipment: exercise.equipment || "Bodyweight"
				};
			}
		}
	}
	return null;
}

function formatRoutine(aiData) {
	const dayAbbreviations = {
		"Monday": "Mon",
		"Tuesday": "Tue",
		"Wednesday": "Wed",
		"Thursday": "Thu",
		"Friday": "Fri",
		"Saturday": "Sat",
		"Sunday": "Sun"
	};

	const formatted = {};

	aiData.forEach(day => {
		const abbr = dayAbbreviations[day.day] || day.day.slice(0, 3);
		formatted[abbr] = {
			title: `${day.type} · ${day.day}`,
			desc: `Today's focus: ${day.type}`,
			exercises: day.exercises.map(ex => ex.name)
		};
	});

	return formatted;
}

// Function to update the exercise routine card
function updateCard(dayName) {
	days.forEach(d => d.classList.remove("active"));

	const selectedBtn = [...days].find(d => d.dataset.day === dayName);
	selectedBtn.classList.add("active");

	const selected = routines[dayName];
	dayCard.querySelector(".card-title").innerHTML = `<i class="fas fa-fire"></i> ${selected.title}`;
	dayCard.querySelector(".card-sub").textContent = selected.desc;

	const oldExercises = dayCard.querySelectorAll(".exercise-card");
	oldExercises.forEach(e => e.remove());

	selected.exercises.forEach(ex => {
		const div = document.createElement("div");
		div.classList.add("exercise-card");
		div.innerHTML = `
	<div class="circle-check check-icon"></div>
	<span class="exercise-text">${ex}</span>
	<i class="fas fa-info-circle"></i>
	`;
		dayCard.appendChild(div);
	});

	dayCard.insertBefore(exerciseTitle, dayCard.querySelector(".exercise-card"));

	dayCard.querySelectorAll('.check-icon').forEach(icon => {
		icon.addEventListener('click', () => {
			icon.classList.toggle('checked');
			icon.closest('.exercise-card').classList.toggle('completed');
			checkIfAllCompleted(); // 🎉
		});
	});

	checkIfAllCompleted();

	dayCard.querySelectorAll('.fa-info-circle').forEach(icon => {
		icon.addEventListener('click', () => {
			const name = icon.previousElementSibling.textContent.trim();
			const data = getExerciseDetailsByName(name);

			if (data) {
				document.getElementById("modal-exercise-name").textContent = name;
				document.getElementById("modal-exercise-description").textContent = data.description;
				const repsFromAI = exerciseRepsMap[name.toLowerCase()];
				document.getElementById("modal-exercise-reps").textContent = "Reps: " + (repsFromAI || data.reps);

				document.getElementById("modal-exercise-image").src = data.image;

				document.getElementById("modal-exercise-target").textContent = "Target: " + (data.target || "N/A");
				document.getElementById("modal-exercise-equipment").textContent = "Equipment: " + (data.equipment || "N/A");
				document.getElementById("exercise-modal").style.display = "flex";
			}

		});
	});

}
// Modal interaction
document.querySelector(".close-modal").addEventListener("click", () => {
	document.getElementById("exercise-modal").style.display = "none";
});


// Navigate through days
days.forEach(day => {
	day.addEventListener("click", () => {
		updateCard(day.dataset.day);
	});
});

updateCard(todayName);

// function for routine completion
function checkIfAllCompleted() {
	const allExercises = dayCard.querySelectorAll('.check-icon');
	const allCompleted = [...allExercises].every(icon => icon.classList.contains('checked'));
	const msg = document.getElementById('completion-message');

	if (allCompleted && allExercises.length > 0) {
		msg.style.display = 'block';

		const activeDay = document.querySelector('.day-circle.active');
		if (activeDay) {
			activeDay.innerHTML = '<i class="fas fa-check"></i>';
			activeDay.style.backgroundColor = 'var(--primary-orange)';
			activeDay.style.color = 'white';
		}
	} else {
		msg.style.display = 'none';

		const activeDay = document.querySelector('.day-circle.active');
		if (activeDay && activeDay.dataset.day) {
			activeDay.textContent = activeDay.dataset.day[0];
		}
	}
}

