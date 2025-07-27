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

const exerciseDescriptions = {
	"Active march": "March in place with your knees lifting slightly and arms swinging naturally. This warms up your whole body and increases your heart rate gradually.",
	"Alternating side lunges": "Step to the side and bend one knee while keeping the other leg straight. Push back to center and repeat on the other side. Keep your chest lifted and core engaged.",
	"Arm & shoulder stretch": "Extend one arm across your chest and use the opposite hand to gently press it closer. Hold for 30 seconds, then switch arms.",
	"Back and chest stretch": "Clasp your hands behind your back and gently lift them while opening your chest. Then round your back and bring your arms forward to stretch your upper back.",
	"Back and torso stretch": "Stand or sit tall, reach both arms forward and round your back, feeling the stretch in your upper spine and lats.",
	"Bicycle crunches": "Lie on your back and alternate touching each elbow to the opposite knee in a pedaling motion, engaging your core throughout.",
	"Bird-dog": "From hands and knees, extend opposite arm and leg at the same time. Hold briefly, then switch sides. Keep your back flat and core tight.",
	"Bodyweight squats": "Stand with feet hip-width apart and lower your hips back and down as if sitting on a chair. Keep your chest up and knees over toes.",
	"Burpees": "From standing, squat down, jump your feet back to a plank, perform a push-up (optional), jump feet forward, then explode upward with a jump.",
	"Crunches": "Lie on your back with knees bent and feet flat. Lift your shoulders off the ground using your abdominal muscles, then slowly lower back down.",
	"Dead bug": "Lie on your back with arms and legs raised. Slowly lower opposite arm and leg toward the floor while keeping your core engaged. Return and switch sides.",
	"Deep breath + stretch to the sky": "Stand tall, inhale deeply as you raise your arms overhead and stretch your whole body upward. Exhale as you lower your arms.",
	"Deep breath with spinal twist": "Sit or stand tall, inhale deeply, and as you exhale, twist your torso gently to one side while keeping your spine elongated.",
	"Downward dog to plank": "From a downward dog pose, shift forward into a high plank, hold briefly, and return to downward dog. Repeat smoothly.",
	"Fast arm circles": "Extend your arms out to the sides and make small, rapid circles forward for half the time, then reverse direction.",
	"Fast march in place": "Lift your knees and pump your arms briskly as if jogging in place, but without jumping.",
	"Floor tricep dips": "Sit with knees bent and hands behind you. Lift hips and bend your elbows to lower your body, then press up using your triceps.",
	"Forearm plank row": "In a forearm plank, lift one arm and simulate a rowing motion while keeping your hips stable. Alternate sides.",
	"Frog pumps": "Lie on your back, bring the soles of your feet together near your glutes. Press your hips up and squeeze your glutes at the top.",
	"Gentle crunches": "Perform crunches slowly and with control, focusing on small movements and deep engagement of your core muscles.",
	"Glute bridge": "Lie on your back with knees bent. Lift your hips off the floor by squeezing your glutes, then lower back down.",
	"Glute bridge march": "While holding a glute bridge position, lift one foot off the floor at a time in a marching motion, keeping hips stable.",
	"Glute kickbacks": "On hands and knees, kick one leg straight back and up, squeezing the glute. Return and switch sides.",
	"Heel raises": "Stand tall and lift your heels to stand on your toes. Pause briefly and lower back down slowly.",
	"High knees": "Run in place while bringing your knees up toward your chest as high and fast as you can.",
	"Jump squats": "Perform a squat, then explode upward into a jump. Land softly and descend into the next squat.",
	"Knee lift march": "March in place lifting your knees higher than usual, engaging your core for balance and control.",
	"Knee lifts": "Stand and alternate lifting each knee toward your chest in a controlled, rhythmic motion.",
	"Lateral leg raises": "Stand tall and lift one leg out to the side, keeping it straight. Lower slowly and repeat. Switch legs.",
	"Leg raises": "Lie on your back and slowly raise your legs until vertical, then lower them back down with control.",
	"Leg raises with pause": "Perform standard leg raises, but hold briefly when your legs are about 45\u00b0 off the ground to increase core engagement.",
	"Low-impact jumping jacks": "Step one foot out to the side while raising both arms overhead, then return to center. Alternate sides without jumping.",
	"Modified jumping jacks": "Do a jumping jack variation with no jump: step side-to-side while raising and lowering arms like in a normal jack.",
	"Modified sun salutation": "A gentler version of sun salutation with controlled movements: raise arms, forward fold, half-lift, step back to plank, downward dog, return.",
	"Mountain climbers": "In a plank position, alternate driving your knees toward your chest at a quick pace, keeping your core tight.",
	"Neck stretch + slow breathing": "Gently tilt your head side to side, holding each stretch for a few seconds, while breathing slowly and deeply.",
	"Paused squats": "Lower into a squat and pause at the bottom for a few seconds before rising, increasing time under tension.",
	"Plank hold": "Hold a forearm or high plank position with your body in a straight line from head to heels, engaging your core.",
	"Plank jacks": "In a plank position, jump your feet out wide and back together, like horizontal jumping jacks.",
	"Plank to down dog push": "From a plank, push your hips up and back into downward dog, then return to plank and repeat.",
	"Plank to shoulder tap": "In a plank, lift one hand to tap the opposite shoulder. Alternate sides while keeping hips stable.",
	"Pulse squats": "Lower into a squat and pulse up and down slightly at the bottom to intensify the burn in your legs.",
	"Push-up hold + reps": "Hold the bottom position of a push-up briefly, then complete the rep. Builds strength and control.",
	"Push-ups": "From plank, lower your body until your chest nearly touches the floor, then push back up. Keep your body in a straight line.",
	"Reverse lunges": "Step one foot back and lower your body until both knees are bent at 90 degrees. Return to start and alternate sides.",
	"Reverse snow angels": "Lie face down with arms at sides, lift chest slightly, and sweep arms out and up like making a snow angel. Keep them off the floor.",
	"Runner's stretch (each side)": "From a lunge position, lower your hands to the ground and extend your back leg. Hold to stretch hips and hamstrings.",
	"Shadow boxing": "Throw light punches in the air while bouncing gently on your feet. Keep it rhythmic and controlled.",
	"Shoulder push-ups": "From downward dog, bend your elbows to lower your head toward the ground, then press back up.",
	"Shoulder rolls": "Lift your shoulders up toward your ears, roll them back and down in a circular motion. Repeat in both directions.",
	"Side lunges": "Step out to one side, bending that knee while keeping the other leg straight. Push back to center and switch.",
	"Side plank pulses": "From a side plank position, lower and lift your hips in small controlled pulses. Repeat on each side.",
	"Single-leg balance": "Stand on one leg and hold for a set time. Use your arms or a wall for support if needed. Switch sides.",
	"Single-leg glute bridge": "Perform a glute bridge with one leg extended straight. Focus on using the grounded glute to lift.",
	"Skaters": "Jump side to side, landing on one foot and bringing the other foot behind. Swing your arms for balance.",
	"Slow bird-dog": "Extend opposite arm and leg slowly, hold, and return. Keep movements smooth and your core braced.",
	"Slow bicycle crunches": "Same as bicycle crunches but performed at a slower pace, focusing on control and core contraction.",
	"Slow burpees (no jump)": "Do the burpee steps without the explosive jump. Step back to plank, step forward, stand up.",
	"Slow push-ups": "Lower and raise your body very slowly during a push-up to increase time under tension.",
	"Slow squats with hold": "Squat down slowly and hold briefly at the bottom before returning to standing. Increases control and strength.",
	"Soft high knees": "March in place with high knees, but avoid bouncing. Keep it light and controlled to warm up.",
	"Soft skaters": "A low-impact version of skaters with gentle side steps and controlled arm movements.",
	"Split squats (no bench)": "Step one foot back into a lunge and stay in place, lowering and lifting in a split stance. Switch legs.",
	"Squats": "Stand with feet shoulder-width apart. Bend your knees and push your hips back as if sitting on a chair. Keep your chest up and your back straight. Return to standing.",
	"Static lunges": "Hold the lunge position with one leg forward and one back, maintaining balance and posture.",
	"Step touch with arms": "Step side to side while swinging or raising your arms to shoulder height in rhythm.",
	"Sun salutation": "A flowing yoga sequence: mountain pose, forward fold, plank, cobra/upward dog, downward dog, and back to standing.",
	"Superman hold": "Lie face down and lift your arms, legs, and chest off the floor. Hold to engage the back and glutes.",
	"Superman hold + reps": "Alternate holding the Superman position with reps of lifting and lowering arms and legs.",
	"Torso twists": "Stand tall, rotate your torso side to side in a controlled motion to loosen up the spine and core.",
	"Walking lunges with torso twist": "Take a step forward into a lunge, then twist your torso toward the front leg. Return and alternate.",
	"Wall push-ups": "Place hands on a wall and perform push-ups by bending elbows and leaning your body toward the wall, then pushing away.",
	"Wall sit": "Lean against a wall and slide down until your thighs are parallel to the floor. Hold that seated position.",
	"Wall sit pulses": "While in a wall sit, pulse slightly up and down to intensify the muscle burn.",
	"Warrior pose (each side)": "From a lunge stance, turn your back foot slightly out and extend your arms to the sides, gazing forward. Hold and switch sides."
};


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
	function createCard(ex, date, checked) {
		const div = document.createElement("div");
		div.classList.add("exercise-card");
		if (checked) div.classList.add("completed");

		div.innerHTML = `
			<div class="exercise-line">
				<label class="circle-check-wrapper">
					<input type="checkbox" class="check-icon" data-exercise="${ex}" data-date="${date}" ${checked ? 'checked' : ''}>
					<span class="circle-check ${checked ? 'checked' : ''}"></span>
					<span class="exercise-text">${ex}</span>
				</label>
				<i class="fas fa-info-circle info-icon" data-exercise="${ex}" title="Exercise Info"></i>
			</div>
		`;

		// 👉 Modal event listener
		const infoIcon = div.querySelector(".info-icon");
		infoIcon.addEventListener("click", (e) => {
			e.stopPropagation(); // 🛑 stop bubbling just in case
			openModal(ex);
		});

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
			const circle = icon.parentElement.querySelector(".circle-check");
			if (circle) {
				circle.classList.toggle("checked", checked);
			}


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

function openModal(name) {
	const modal = document.getElementById("exercise-modal");
	const closeBtn = modal.querySelector(".close-modal");

	// Solo usamos la descripción
	const description = exerciseDescriptions[name] || "No description available for this exercise.";

	document.getElementById("modal-exercise-name").textContent = name;
	document.getElementById("modal-exercise-description").textContent = description;

	modal.classList.remove("hidden");

	// Cerrar con la X
	closeBtn.onclick = () => modal.classList.add("hidden");

	// Cerrar al hacer clic fuera del modal
	window.onclick = e => {
		if (e.target === modal) {
			modal.classList.add("hidden");
		}
	};
}


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
