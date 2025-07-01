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

// Mockup Routine Plan.
const routines = {
	Mon: { title: "Fat Burn · Today", desc: "Blasts calories and boosts endurance", exercises: ["Jumping Jacks", "Plank Jacks", "Squats"] },
	Tue: { title: "Core Power", desc: "Focus on core muscles", exercises: ["Crunches", "Leg Raises", "Plank Hold"] },
	Wed: { title: "Cardio Boost", desc: "Raise your heart rate", exercises: ["Burpees", "High Knees", "Butt Kickers"] },
	Thu: { title: "Lower Body", desc: "Target glutes and legs", exercises: ["Lunges", "Step Ups", "Wall Sit"] },
	Fri: { title: "Upper Body", desc: "Arms and shoulders", exercises: ["Push Ups", "Tricep Dips", "Arm Circles"] },
	Sat: { title: "Rest Day", desc: "No exercises today", exercises: [] },
	Sun: { title: "Stretch & Mobility", desc: "Gentle recovery", exercises: ["Neck Rolls", "Hip Circles", "Forward Fold"] }
};

// Mockup Exercise details.
const exerciseDetails = {
	"Jumping Jacks": {
		description: "Jumping jacks are a classic full-body cardio move that gets your heart pumping and your blood flowing. They improve coordination, stamina, and boost calorie burn fast! Perfect for warm-ups or quick sweat sessions. Let’s get that energy UP!",
		reps: "15",
		image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnh3MnlxN3F6NHp0dzFyNHVhcG5taGx5YmFoaWttY3l6MHk3bTRzdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ckMk3RKUK29lziaspI/giphy.gif",
		target: "Full Body",
		equipment: "None"
	}
};

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
			const data = exerciseDetails[name];

			if (data) {
				document.getElementById("modal-exercise-name").textContent = name;
				document.getElementById("modal-exercise-description").textContent = data.description;
				document.getElementById("modal-exercise-reps").textContent = "Reps: " + data.reps;
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

