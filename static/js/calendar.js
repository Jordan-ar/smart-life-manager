// --- Configuración base del usuario ---
const timeAvailable = parseInt(userPlan.time_available); // 15, 30 o 60
const daysPerWeek = parseInt(userPlan.days_per_week); // 2, 4, 6
const motivation = userPlan.goal.toLowerCase(); // "lose_weight", etc.

// --- Rutinas simplificadas (solo circuito) ---
const routine_lose_weight = [
	{ name: "Full Body HIIT", circuit: ["Jump squats", "Shoulder taps", "Reverse lunges", "High knees"] },
	{ name: "Legs & Glutes", circuit: ["Squats", "Glute bridges", "Side lunges", "Wall sit"] },
	{ name: "Cardio Dance + Core", circuit: ["Step touch with arms", "Crunches", "Russian twists", "Mountain climbers"] },
	{ name: "Upper Body + Core", circuit: ["Fast arm circles", "Push-ups", "Plank to shoulder tap", "Bicycle crunches"] },
	{ name: "Explosive HIIT + Core", circuit: ["Burpees", "Skaters", "Plank jacks", "Leg raises"] },
	{ name: "Yoga Toning Flow", circuit: ["Sun salutation", "Warrior pose (each side)", "Downward dog to plank", "Glute kickbacks"] }
];

const routine_gain_muscle = [
	{ name: "Legs & Glutes", circuit: ["Slow squats with hold", "Glute bridge march", "Wall sit pulses", "Alternating side lunges"] },
	{ name: "Push Day (Chest, Shoulders, Triceps)", circuit: ["Slow push-ups", "Plank to down dog push", "Floor tricep dips", "Shoulder push-ups"] },
	{ name: "Legs & Glutes Vol. 2", circuit: ["Split squats (no bench)", "Single-leg glute bridge", "Frog pumps", "Pulse squats"] },
	{ name: "Pull Day (Back, Biceps, Core)", circuit: ["Superman hold + reps", "Reverse snow angels", "Forearm plank row", "Slow bicycle crunches"] },
	{ name: "Full Body Strength", circuit: ["Slow burpees (no jump)", "Squat to calf raise", "Push-up hold + reps", "Leg raises with pause"] },
	{ name: "Core & Stability", circuit: ["Plank hold", "Slow bird-dog", "Side plank pulses", "Dead bug"] }
];

const routine_stay_healthy = [
	{ name: "Mobility + Light Cardio", circuit: ["Step touch with arms", "Torso twists", "Knee lift march", "Modified jumping jacks"] },
	{ name: "Functional Strength", circuit: ["Bodyweight squats", "Wall push-ups", "Heel raises", "Bird-dog"] },
	{ name: "Core + Posture", circuit: ["Glute bridge", "Gentle crunches", "Superman hold", "Dead bug"] },
	{ name: "Light Endurance + Coordination", circuit: ["Fast march in place", "Knee lifts", "Soft skaters", "Shadow boxing"] },
	{ name: "Legs + Balance", circuit: ["Static lunges", "Paused squats", "Lateral leg raises", "Single-leg balance"] },
	{ name: "Yoga Flow + Breathing", circuit: ["Modified sun salutation", "Downward dog to plank", "Back and chest stretch", "Deep breath with spinal twist"] }
];


// --- Warm-up & Cool down (fijos para todos) ---
const warmup = [
	"Active march",
	"Torso twists",
	"Low-impact jumping jacks",
	"Shoulder rolls",
	"Soft high knees",
	"Walking lunges with torso twist"
];

const cooldown = [
	"Deep breath + stretch to the sky",
	"Runner’s stretch (each side)",
	"Back and torso stretch",
	"Arm & shoulder stretch",
	"Neck stretch + slow breathing"
];

// --- Select routine and description based on user goal ---
let selectedRoutine;
let baseDescription = "";

if (motivation === "lose_weight") {
	selectedRoutine = routine_lose_weight;
	baseDescription = "Burn fat, boost your metabolism, and feel the sweat";
} else if (motivation === "gain_muscle") {
	selectedRoutine = routine_gain_muscle;
	baseDescription = "Build lean muscle, sculpt your body, and feel stronger every rep";
} else if (motivation === "stay_healthy") {
	selectedRoutine = routine_stay_healthy;
	baseDescription = "Move with ease, stay mobile, and support your long-term wellness";
} else {
	selectedRoutine = routine_lose_weight; // fallback
	baseDescription = "Default plan: HIIT workouts to keep you moving";
}


// --- Día de la semana actual ---
const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayName = dayOrder[new Date().getDay() - 1] || "Sun";

// --- Asignación cíclica de rutina semanal ---
function generateRoutinePlan(routine, daysPerWeek) {
	const plan = {};
	let index = 0;
	for (let i = 0; i < 7; i++) {
		if ((i % Math.floor(7 / daysPerWeek) === 0) && index < routine.length) {
			plan[dayOrder[i]] = routine[index++];
		} else {
			plan[dayOrder[i]] = null;
		}
	}
	return plan;
}

const thisWeek = generateRoutinePlan(selectedRoutine, daysPerWeek);

// --- Guardar rutina en backend ---
fetch("/save-routine", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ routine: thisWeek })
});

// --- Renderizado del día ---
const days = document.querySelectorAll(".day-circle");
const subtitle = document.getElementById("plan-subtitle");
const dayCard = document.getElementById("day-card");
const exerciseTitle = document.querySelector(".exercise-title");

async function updateCard(dayName) {
	days.forEach(d => d.classList.remove("active"));
	const selectedBtn = [...days].find(d => d.dataset.day === dayName);
	if (selectedBtn) selectedBtn.classList.add("active");

	const selected = thisWeek[dayName];

	const warmupContainer = document.getElementById("warmup-section");
	const circuitContainer = document.getElementById("circuit-section");
	const cooldownContainer = document.getElementById("cooldown-section");

	// Limpiar secciones
	[warmupContainer, circuitContainer, cooldownContainer].forEach(div => div.innerHTML = "");

	if (!selected) {
		dayCard.querySelector(".card-title").innerHTML = `<i class="fas fa-bed"></i> Rest Day`;
		dayCard.querySelector(".card-sub").textContent = "No exercises planned for today. Enjoy your rest!";
		document.getElementById("completion-message").style.display = "none";
		return;
	}

	// Header del día
	dayCard.querySelector(".card-title").innerHTML = `<i class="fas fa-fire"></i> ${selected.name}`;
	const subtitleEl = dayCard.querySelector(".card-sub");
	subtitleEl.textContent = baseDescription;

	// 👉 Función para crear cada card de ejercicio
	function createCard(ex, date, checked) {
		const div = document.createElement("div");
		div.classList.add("exercise-card");
		if (checked) div.classList.add("completed");

		div.innerHTML = `
			<label>
				<input type="checkbox" class="check-icon" data-exercise="${ex}" data-date="${date}" ${checked ? 'checked' : ''}>
				<span class="exercise-text">${ex}</span>
			</label>
		`;
		return div;
	}

	// 👉 Función para pedir al backend si ese ejercicio ya fue completado
	async function fetchCompletion(exercise, date) {
		const res = await fetch(`/get-progress?date=${date}&exercise_name=${encodeURIComponent(exercise)}`);
		const data = await res.json();
		return data.completed;
	}

	// 🧡 Render warm-up
	for (const ex of warmup) {
		const isDone = await fetchCompletion(ex, dayName);
		warmupContainer.appendChild(createCard(ex, dayName, isDone));
	}

	// 🔥 Render circuito según reps
	const reps = timeAvailable === 15 ? 1 : timeAvailable === 30 ? 2 : 5;
	for (let i = 0; i < reps; i++) {
		for (const ex of selected.circuit) {
			const isDone = await fetchCompletion(ex, dayName);
			circuitContainer.appendChild(createCard(ex, dayName, isDone));
		}
	}

	// 🌈 Render cool down si aplica
	if (timeAvailable >= 30) {
		for (const ex of cooldown) {
			const isDone = await fetchCompletion(ex, dayName);
			cooldownContainer.appendChild(createCard(ex, dayName, isDone));
		}
	}

	// 🧠 Tabs
	document.querySelectorAll(".tab-button").forEach(btn => {
		btn.addEventListener("click", () => {
			document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
			document.querySelectorAll(".exercise-tab").forEach(tab => tab.classList.add("hidden"));
			btn.classList.add("active");
			const tabTarget = btn.getAttribute("data-target");
			document.getElementById(tabTarget).classList.remove("hidden");

			// Cambiar subtítulo
			if (tabTarget === "circuit-section") {
				subtitleEl.textContent = "Each exercise lasts 2 minutes with 30 seconds of rest.";
			} else {
				subtitleEl.textContent = baseDescription;
			}
		});
	});

	// ✨ Listeners de los checkboxes
	document.querySelectorAll('.check-icon').forEach(icon => {
		icon.addEventListener('change', async () => {
			const card = icon.closest('.exercise-card');
			const checked = icon.checked;
			card.classList.toggle('completed', checked);

			const date = icon.dataset.date;
			const exercise = icon.dataset.exercise;

			await fetch('/set-progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ date, exercise_name: exercise, completed: checked })
			});

			checkIfAllCompleted(date);
		});
	});

	// Verifica si todos los ejercicios están completados y actualiza el mensajito
	checkIfAllCompleted(dayName);
}

// --- Check completo ---
function checkIfAllCompleted(dayName) {
	const all = [...dayCard.querySelectorAll('.check-icon')];
	const done = all.every(i => i.checked);
	const msg = document.getElementById("completion-message");

	if (done && all.length > 0) {
		msg.style.display = 'block';
		localStorage.setItem(`highlight-${dayName}`, 'true');
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

// --- Listeners ---
days.forEach(day => day.addEventListener("click", () => updateCard(day.dataset.day)));

document.addEventListener("DOMContentLoaded", () => {
	updateCard(todayName);
	days.forEach(day => {
		const d = day.dataset.day;
		if (localStorage.getItem(`highlight-${d}`) === 'true') {
			day.innerHTML = '<i class="fas fa-check"></i>';
			day.style.backgroundColor = 'var(--primary-orange)';
			day.style.color = 'white';
		}
	});
});
