// Configuración del usuario para este test
const timeAvailable = parseInt(userPlan.time_available); // 15, 30 o 60
const daysPerWeek = parseInt(userPlan.days_per_week); // 2, 4, 6
const motivation = userPlan.goal; // "lose_weight", etc.


// Tu rutina: lose_weight
const routine_lose_weight = [
	{
		name: "Full Body HIIT",
		warmup: ["High march", "Arm circles", "Jumping jacks", "Torso twist"],
		circuits: [
			["Air squats", "Knee push-ups", "Glute bridges", "Crunches"],
			["Jump squats", "Push-ups", "Leg raises", "Plank shoulder taps"],
			["Skaters", "Mountain climbers (30s)", "Russian twists", "Bicycle crunches"]
		],
		cooldown: ["Quadriceps stretch", "Forward fold", "Shoulder stretch", "Deep squat", "Breathing"]
	},
	{
		name: "Legs & Glutes",
		warmup: ["March", "Hip circles", "Lunges", "Air squats", "Wall sit (30s)"],
		circuits: [
			["Air squats", "Glute bridges", "Donkey kicks", "Reverse lunges"],
			["Pulsing squats", "Side lunges", "Glute bridge march", "Wall sit"],
			["Jump squats", "Step touch", "Squat hold (30s)", "Mountain climbers"]
		],
		cooldown: ["Glutes stretch", "Hamstring stretch", "Ankle mobility", "Lower back stretch", "Breathing"]
	},
	{
		name: "Cardio + Core",
		warmup: ["Step touch", "Shoulder rolls", "Jumping jacks", "Torso twist", "Air punches"],
		circuits: [
			["High march", "Crunches", "Plank", "Heel touches"],
			["Skaters", "Leg raises", "Russian twists", "Bicycle crunches"],
			["Jumping jacks", "Push-ups", "Mountain climbers (30s)", "Sit ups"]
		],
		cooldown: ["Core stretch", "Spinal twist", "Cat-cow", "Breathing"]
	},
	{
		name: "Upper Body + Core",
		warmup: ["Arm swings", "Air punches", "Wall plank", "Shoulder rolls", "Jumping jacks"],
		circuits: [
			["Knee push-ups", "Plank shoulder taps", "Crunches", "Arm raises"],
			["Push-ups", "Leg raises", "Russian twists", "Reverse crunches"],
			["Plank hold (30s)", "Superman", "Bicycle crunches", "Heel touches"]
		],
		cooldown: ["Arm stretch", "Back stretch", "Core stretch", "Breathing"]
	},
	{
		name: "Explosive HIIT",
		warmup: ["Fast march", "Jumping jacks", "Squats", "Arm circles", "Plank hold"],
		circuits: [
			["Jump squats", "Push-ups", "Crunches", "Mountain climbers"],
			["Skaters", "Leg raises", "High knees (30s)", "Plank shoulder taps"],
			["Air squats", "Russian twists", "Burpees (modified)", "Sit ups"]
		],
		cooldown: ["Leg stretch", "Core stretch", "Full body stretch", "Breathing"]
	},
	{
		name: "Yoga Flow + Core",
		warmup: ["Inhalations", "Cat-cow", "Torso stretch", "Gentle march", "Squat hold"],
		circuits: [
			["Glute bridges", "Crunches", "Plank hold", "Warrior II"],
			["Side lunges", "Reverse crunches", "Downward dog", "Plank"],
			["Donkey kicks", "Leg raises", "Boat pose (30s)", "Squat pulses"]
		],
		cooldown: ["Full body stretch", "Slow breathing", "Guided stretching"]
	},
	{
		name: "Recovery",
		warmup: ["Slow march", "Arm circles", "Head rolls", "Toe touches", "Breathing"],
		circuits: [
			["Walk in place", "Knee lifts", "Step touch", "Air squats"],
			["Glute bridge", "Wall sit (30s)", "Russian twist", "Plank hold"],
			["Dynamic stretch", "Forward fold", "Cat-cow", "Gratitude breath"]
		],
		cooldown: ["Total relaxation", "Deep breathing"]
	}
];

const routine_gain_muscle = [
	{
		name: "Full Body Strength",
		warmup: ["High march", "Arm circles", "Jumping jacks", "Air squats", "Shoulder rolls"],
		circuits: [
			["Air squats", "Knee push-ups", "Glute bridges", "Crunches"],
			["Jump squats", "Push-ups", "Plank shoulder taps", "Donkey kicks"],
			["Side lunges", "Leg raises", "Russian twists", "Wall sit (30s)"]
		],
		cooldown: ["Leg stretch", "Arm stretch", "Deep breathing"]
	},
	{
		name: "Glutes & Legs",
		warmup: ["March", "Hip circles", "Toe touches", "Glute bridges", "Squats"],
		circuits: [
			["Air squats", "Donkey kicks", "Glute bridges", "Reverse lunges"],
			["Pulsing squats", "Wall sit (30s)", "Side lunges", "Squat hold"],
			["Jump squats", "Step touch", "Glute bridge march", "Mountain climbers"]
		],
		cooldown: ["Glute stretch", "Quadriceps stretch", "Hamstring stretch"]
	},
	{
		name: "Core Power",
		warmup: ["Step touch", "Arm swings", "Jumping jacks", "Plank hold (30s)", "Crunches"],
		circuits: [
			["Crunches", "Plank", "Leg raises", "Heel touches"],
			["Russian twists", "Sit ups", "Bicycle crunches", "Plank shoulder taps"],
			["Reverse crunches", "Superman", "Boat pose (30s)", "Mountain climbers"]
		],
		cooldown: ["Core stretch", "Cat-cow", "Deep breathing"]
	},
	{
		name: "Upper Body",
		warmup: ["Light march", "Air punches", "Arm circles", "Jumping jacks", "Wall plank"],
		circuits: [
			["Knee push-ups", "Arm raises", "Plank hold (30s)", "Crunches"],
			["Push-ups", "Shoulder taps", "Leg raises", "Plank to push"],
			["Superman", "Side plank dips", "Reverse crunches", "Crunches"]
		],
		cooldown: ["Arm stretch", "Neck stretch", "Back stretch"]
	},
	{
		name: "Full Body Power",
		warmup: ["Jumping jacks", "Air squats", "High knees", "Arm swings", "Deep squat"],
		circuits: [
			["Push-ups", "Air squats", "Leg raises", "Russian twists"],
			["Glute bridges", "Plank shoulder taps", "Crunches", "Wall sit (30s)"],
			["Jump squats", "Mountain climbers", "Superman", "Sit ups"]
		],
		cooldown: ["Full body stretch", "Slow breathing"]
	},
	{
		name: "Glute Focus + Core",
		warmup: ["High march", "Donkey kicks", "Glute bridge", "Torso twist", "Squat pulses"],
		circuits: [
			["Glute bridges", "Air squats", "Leg raises", "Heel touches"],
			["Pulsing squats", "Donkey kicks", "Crunches", "Reverse crunches"],
			["Step touch", "Squat hold", "Plank", "Russian twists"]
		],
		cooldown: ["Glute stretch", "Core stretch", "Relaxation"]
	},
	{
		name: "Recovery + Core Flow",
		warmup: ["Deep breathing", "Step touch", "Arm swings", "Cat-cow", "Forward fold"],
		circuits: [
			["Wall sit (30s)", "Glute bridges", "Crunches", "Plank hold (30s)"],
			["Side lunges", "Plank shoulder taps", "Russian twists", "Sit ups"],
			["Boat pose", "Deep squat hold", "Breathing 4-7-8", "Gratitude pause"]
		],
		cooldown: ["Full body stretch", "Slow breathing"]
	}
];

const routine_stay_healthy = [
	{
		name: "Active Full Body",
		warmup: ["Light march", "Arm circles", "Torso twist", "Air squats", "Toe touches"],
		circuits: [
			["Air squats", "Knee push-ups", "Glute bridges", "Heel touches"],
			["Side lunges", "Wall sit (30s)", "Leg raises", "Crunches"],
			["March in place", "Donkey kicks", "Russian twists", "Plank hold (30s)"]
		],
		cooldown: ["Full body stretch", "Deep breathing"]
	},
	{
		name: "Glutes & Lower Body",
		warmup: ["March", "Lunges", "Glute bridges", "Squats", "Deep squat hold"],
		circuits: [
			["Air squats", "Glute bridges", "Step touch", "Wall sit"],
			["Donkey kicks", "Side lunges", "Squat pulses", "Reverse lunges"],
			["Pulsing squats", "Leg raises", "Glute bridge march", "Toe taps"]
		],
		cooldown: ["Glute stretch", "Leg stretch", "Lower back stretch", "Slow breathing"]
	},
	{
		name: "Core & Mobility",
		warmup: ["March", "Torso twist", "Arm swings", "Cat-cow", "Plank hold"],
		circuits: [
			["Crunches", "Leg raises", "Heel touches", "Russian twists"],
			["Sit ups", "Reverse crunches", "Mountain climbers (30s)", "Plank"],
			["Boat pose (30s)", "Bicycle crunches", "Wall sit (30s)", "Deep squat"]
		],
		cooldown: ["Core stretch", "Spinal twist", "Mindful breathing"]
	},
	{
		name: "Upper Body & Core",
		warmup: ["Arm swings", "Shoulder rolls", "Plank hold", "Air punches", "Wall plank"],
		circuits: [
			["Arm raises", "Knee push-ups", "Crunches", "Heel touches"],
			["Plank shoulder taps", "Leg raises", "Reverse crunches", "Wall sit"],
			["Push-ups", "Arm circles", "Russian twists", "Plank hold"]
		],
		cooldown: ["Arm stretch", "Neck stretch", "Chest stretch"]
	},
	{
		name: "Energizing Flow",
		warmup: ["Low impact jumping jacks", "Torso twist", "Toe touches", "Squat pulses", "Breathing"],
		circuits: [
			["High march", "Glute bridges", "Air squats", "Crunches"],
			["Step touch", "Donkey kicks", "Leg raises", "Sit ups"],
			["Plank hold", "Reverse lunges", "Heel touches", "Russian twists"]
		],
		cooldown: ["Full body stretch", "Gratitude breath"]
	},
	{
		name: "Functional Movement & Balance",
		warmup: ["March in place", "Cat-cow", "Torso twist", "Arm swings", "Squat pulses"],
		circuits: [
			["Glute bridges", "Step touch", "Leg raises", "Deep squat hold"],
			["Donkey kicks", "Wall sit", "Plank shoulder taps", "Heel touches"],
			["Side lunges", "Mountain climbers (30s)", "Russian twists", "Squat hold"]
		],
		cooldown: ["Full body stretch", "Breathing 4-7-8", "Mindfulness reset"]
	},
	{
		name: "Recovery Day",
		warmup: ["Deep breathing", "Joint mobility", "Gentle stretches", "Slow march", "Cat-cow"],
		circuits: [
			["Glute bridge", "Crunches", "Plank hold (30s)", "Wall sit (30s)"],
			["Russian twists", "Leg raises", "Heel touches", "Dynamic stretch"],
			["Gratitude pause", "Breathing 4-7-8", "Body scan", "Deep squat hold"]
		],
		cooldown: ["Guided stretch", "Full relaxation"]
	}
];



// Mapeo para días
const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const days = document.querySelectorAll(".day-circle");
const subtitle = document.getElementById("plan-subtitle");
const dayCard = document.getElementById("day-card");
const exerciseTitle = document.querySelector(".exercise-title");

// Día de la semana actual
const todayName = dayOrder[new Date().getDay() - 1] || "Sun";

// Generar el plan para esta semana
function generateRoutinePlan(routine, daysPerWeek) {
	const plan = {};
	let used = 0;
	for (let i = 0; i < 7; i++) {
		if (used < daysPerWeek) {
			plan[dayOrder[i]] = routine[i];
			used++;
		} else {
			plan[dayOrder[i]] = null;
		}
	}
	return plan;
}

let selectedRoutine;
let repsRestText = "";
let baseDescription = "";

if (motivation === "lose_weight") {
	selectedRoutine = routine_lose_weight;
	repsRestText = "12 reps · 30s rest";
	baseDescription = "Full body HIIT and fat-burning workouts to boost your metabolism and burn calories.";
} else if (motivation === "gain_muscle") {
	selectedRoutine = routine_gain_muscle;
	repsRestText = "12–15 reps · 45s rest";
	baseDescription = "Strength-focused training to build muscle and tone your body with progressive bodyweight movements.";
} else if (motivation === "stay_healthy") {
	selectedRoutine = routine_stay_healthy;
	repsRestText = "10–12 reps · 20–45s rest";
	baseDescription = "Balanced movement to maintain health, improve mobility, and stay active without overtraining.";
} else {
	selectedRoutine = routine_lose_weight; // Fallback
	repsRestText = "12 reps · 30s rest";
	baseDescription = "Full body HIIT and fat-burning workouts to boost your metabolism and burn calories.";
}

const thisWeek = generateRoutinePlan(selectedRoutine, daysPerWeek);

// Función para renderizar el día
function updateCard(dayName) {
	days.forEach(d => d.classList.remove("active"));

	const selectedBtn = [...days].find(d => d.dataset.day === dayName);
	if (selectedBtn) selectedBtn.classList.add("active");

	const selected = thisWeek[dayName];

	// Limpieza previa
	const oldExercises = dayCard.querySelectorAll(".exercise-card");
	oldExercises.forEach(e => e.remove());

	if (!selected) {
		dayCard.querySelector(".card-title").innerHTML = `<i class="fas fa-bed"></i> Rest Day`;
		dayCard.querySelector(".card-sub").textContent = "No exercises planned for today. Enjoy your rest!";
		document.getElementById("completion-message").style.display = "none";
		return;
	}

	// Título y descripción
	dayCard.querySelector(".card-title").innerHTML = `<i class="fas fa-fire"></i> ${selected.name} · ${repsRestText}`;
	dayCard.querySelector(".card-sub").textContent = baseDescription;

	// Armar secciones según tiempo
	const sections = [];

	if (timeAvailable >= 15) {
		sections.push(...selected.warmup);
	}

	if (timeAvailable >= 15) {
		sections.push(...selected.circuits[0]);
	}
	if (timeAvailable >= 30) {
		sections.push(...selected.circuits[1]);
	}
	if (timeAvailable === 60) {
		sections.push(...selected.circuits[2]);
		sections.push(...selected.cooldown);
	}

	sections.forEach(ex => {
		const div = document.createElement("div");
		div.classList.add("exercise-card");
		div.innerHTML = `
			<div class="circle-check check-icon"></div>
			<span class="exercise-text">${ex}</span>
		`;
		dayCard.appendChild(div);
	});

	dayCard.insertBefore(exerciseTitle, dayCard.querySelector(".exercise-card"));

	dayCard.querySelectorAll('.check-icon').forEach(icon => {
		icon.addEventListener('click', () => {
			icon.classList.toggle('checked');
			icon.closest('.exercise-card').classList.toggle('completed');
			checkIfAllCompleted();
		});
	});

	checkIfAllCompleted();
}

// Modal (se ignora por ahora, pero dejamos el cierre activo)
// document.querySelector(".close-modal").addEventListener("click", () => {
// 	document.getElementById("exercise-modal").style.display = "none";
// });

// Navegación entre días
days.forEach(day => {
	day.addEventListener("click", () => {
		updateCard(day.dataset.day);
	});
});

updateCard(todayName);

// Check completo
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
