
// Let the page load before running the script.
document.addEventListener("DOMContentLoaded", () => {

	// Keep track of the steps and current step.
	const steps = Array.from(document.querySelectorAll(".welcome-card"));
	let currentStep = 0;
	const answers = {};

	// Everything for the bar progress.
	const TOTAL_SEGMENTS = 12;
	const progressBar = document.getElementById("progress-bar");
	for (let i = 0; i < TOTAL_SEGMENTS; i++) {
		const segment = document.createElement("div");
		segment.classList.add("progress-segment");
		progressBar.appendChild(segment);
	}
	const segments = document.querySelectorAll(".progress-segment");

	// Function to update the progress bar based on the current step index.
	function updateProgress(index) {
		segments.forEach((seg, i) => {
			seg.classList.toggle("active", i < index);
		});
	}

	// Function to manage the visibility of steps and update the bar.
	function showStep(index) {
		steps[currentStep].classList.add("hidden");
		steps[index].classList.remove("hidden");
		currentStep = index;
		if (index >= 1 && index <= TOTAL_SEGMENTS) {
			updateProgress(index);
		} else {
			updateProgress(0);
		}
	}

	// Function to handle the back button functionality.
	function handleBackButton(id, toIndex) {
		const btn = document.getElementById(id);
		if (btn) btn.addEventListener("click", () => showStep(toIndex));
	}

	// Function to handle the option selections and navigation.
	function handleOptionStep({ stepId, nextBtnId, resultKey, nextStepIndex, backBtnId, backStepIndex }) {
		const step = document.getElementById(stepId);
		const options = step.querySelectorAll(".option-btn");
		const nextBtn = document.getElementById(nextBtnId);
		let selectedValue = null;

		options.forEach((btn) => {
			btn.addEventListener("click", () => {
				options.forEach((b) => b.classList.remove("selected"));
				btn.classList.add("selected");
				selectedValue = btn.dataset.value;
				nextBtn.disabled = false;
			});
		});

		nextBtn.addEventListener("click", () => {
			if (selectedValue) {
				answers[resultKey] = selectedValue;
				showStep(nextStepIndex);
			}
		});

		handleBackButton(backBtnId, backStepIndex);
	}

	// Function to handle input steps with validation.
	function handleInputStep({ inputId, nextBtnId, resultKey, min, max, nextStepIndex, backBtnId, backStepIndex }) {
		const input = document.getElementById(inputId);
		const nextBtn = document.getElementById(nextBtnId);

		input.addEventListener("input", () => {
			const val = parseInt(input.value);
			nextBtn.disabled = isNaN(val) || val < min || val > max;
		});

		nextBtn.addEventListener("click", () => {
			const val = parseInt(input.value);
			if (!isNaN(val) && val >= min && val <= max) {
				answers[resultKey] = val;
				showStep(nextStepIndex);
			}
		});

		handleBackButton(backBtnId, backStepIndex);
	}

	// Function to handle checkbox steps with multiple selections.
	function handleCheckboxStep({ stepId, nextBtnId, resultKey, nextStepIndex, backBtnId, backStepIndex }) {
		const step = document.getElementById(stepId);
		const labels = step.querySelectorAll(".option-checkbox");
		const nextBtn = document.getElementById(nextBtnId);
		let selections = [];

		labels.forEach((label) => {
			label.addEventListener("click", () => {
				const cb = label.querySelector("input");
				cb.checked = !cb.checked;
				label.classList.toggle("selected", cb.checked);

				selections = Array.from(labels)
					.filter((l) => l.querySelector("input").checked)
					.map((l) => l.querySelector("input").value);

				nextBtn.disabled = selections.length === 0;
			});
		});

		nextBtn.addEventListener("click", () => {
			answers[resultKey] = selections;
			showStep(nextStepIndex);
		});

		handleBackButton(backBtnId, backStepIndex);
	}

	// Function to handle unit toggling and input validation.
	function handleToggleUnitInputStep({
		toggleId,
		unitBtnsSelector,
		inputGroups,
		inputFields,
		unitNames,
		validation,
		resultKey,
		nextBtnId,
		nextStepIndex,
		backBtnId,
		backStepIndex
	}) {
		let currentUnit = unitNames[0];
		const toggle = document.getElementById(toggleId);
		const btns = toggle.querySelectorAll(unitBtnsSelector);
		const nextBtn = document.getElementById(nextBtnId);

		// Show only the input for the unit selected.
		function toggleUnit(unit) {
			currentUnit = unit;
			btns.forEach(btn => {
				btn.classList.toggle("active", btn.dataset.unit === unit);
			});
			unitNames.forEach(u => {
				document.getElementById(inputGroups[u]).classList.toggle("hidden", u !== unit);
			});
			validate();
		}

		// Validate the input based on the current unit.
		function validate() {
			const isValid = validation[currentUnit]();
			nextBtn.disabled = !isValid;
		}
		// Add input event listeners for validation.
		unitNames.forEach(unit => {
			inputFields[unit].forEach(id => {
				const input = document.getElementById(id);
				input.addEventListener("input", validate);
			});
		});
		btns.forEach(btn => {
			btn.addEventListener("click", () => toggleUnit(btn.dataset.unit));
		});
		nextBtn.addEventListener("click", () => {
			answers[resultKey] = validation[currentUnit](true);
			showStep(nextStepIndex);
		});
		handleBackButton(backBtnId, backStepIndex);
		toggleUnit(currentUnit);
	}

	// Start the onboarding process by showing the first step.
	document.getElementById("start-btn").addEventListener("click", () => showStep(1));

	// Handle each step with the appropriate function.
	handleOptionStep({ stepId: "question-step-1", nextBtnId: "next-btn", resultKey: "Motivation", nextStepIndex: 2 });
	handleOptionStep({ stepId: "question-step-2", nextBtnId: "next-btn-2", resultKey: "Gender", nextStepIndex: 3, backBtnId: "back-btn-2", backStepIndex: 1 });
	handleInputStep({ inputId: "age-input", nextBtnId: "next-btn-3", resultKey: "Age", min: 13, max: 120, nextStepIndex: 4, backBtnId: "back-btn-3", backStepIndex: 2 });
	const toggleUnitSteps = [
		{
			toggleId: "height-toggle",
			unitBtnsSelector: ".toggle-btn",
			inputGroups: { imperial: "imperial-inputs", metric: "metric-inputs" },
			inputFields: { imperial: ["feet-input", "inches-input"], metric: ["cm-input"] },
			unitNames: ["imperial", "metric"],
			resultKey: "Height",
			nextBtnId: "next-btn-4",
			nextStepIndex: 5,
			backBtnId: "back-btn-4",
			backStepIndex: 3,
			validation: {
				imperial: (returnValue = false) => {
					const feet = parseInt(document.getElementById("feet-input").value);
					const inches = parseInt(document.getElementById("inches-input").value);
					const valid = !isNaN(feet) && feet >= 3 && feet <= 8 && !isNaN(inches) && inches >= 0 && inches <= 11;
					return returnValue && valid ? (feet * 12 + inches) : valid;
				},
				metric: (returnValue = false) => {
					const cm = parseInt(document.getElementById("cm-input").value);
					const valid = !isNaN(cm) && cm >= 90 && cm <= 250;
					return returnValue && valid ? cm : valid;
				}
			}
		},
		{
			toggleId: "weight-toggle",
			unitBtnsSelector: ".toggle-btn",
			inputGroups: { lbs: "lbs-input-group", kg: "kg-input-group" },
			inputFields: { lbs: ["weight-input-lbs"], kg: ["weight-input-kg"] },
			unitNames: ["lbs", "kg"],
			resultKey: "Current Weight",
			nextBtnId: "next-btn-5",
			nextStepIndex: 6,
			backBtnId: "back-btn-5",
			backStepIndex: 4,
			validation: {
				lbs: (ret = false) => {
					const val = parseInt(document.getElementById("weight-input-lbs").value);
					const valid = !isNaN(val) && val >= 66 && val <= 550;
					return ret && valid ? val : valid;
				},
				kg: (ret = false) => {
					const val = parseInt(document.getElementById("weight-input-kg").value);
					const valid = !isNaN(val) && val >= 30 && val <= 250;
					return ret && valid ? val : valid;
				}
			}
		},
		{
			toggleId: "goal-weight-toggle",
			unitBtnsSelector: ".toggle-btn",
			inputGroups: { lbs: "goal-lbs-input-group", kg: "goal-kg-input-group" },
			inputFields: { lbs: ["goal-weight-input-lbs"], kg: ["goal-weight-input-kg"] },
			unitNames: ["lbs", "kg"],
			resultKey: "Goal Weight",
			nextBtnId: "next-btn-6",
			nextStepIndex: 7,
			backBtnId: "back-btn-6",
			backStepIndex: 5,
			validation: {
				lbs: (ret = false) => {
					const val = parseInt(document.getElementById("goal-weight-input-lbs").value);
					const valid = !isNaN(val) && val >= 66 && val <= 550;
					return ret && valid ? val : valid;
				},
				kg: (ret = false) => {
					const val = parseInt(document.getElementById("goal-weight-input-kg").value);
					const valid = !isNaN(val) && val >= 30 && val <= 250;
					return ret && valid ? val : valid;
				}
			}
		}
	];
	toggleUnitSteps.forEach(config => handleToggleUnitInputStep(config));
	handleOptionStep({ stepId: "question-step-7", nextBtnId: "next-btn-7", resultKey: "Goal Speed", nextStepIndex: 8, backBtnId: "back-btn-7", backStepIndex: 6 });
	handleOptionStep({ stepId: "question-step-8", nextBtnId: "next-btn-8", resultKey: "Training Days", nextStepIndex: 9, backBtnId: "back-btn-8", backStepIndex: 7 });
	handleOptionStep({ stepId: "question-step-9", nextBtnId: "next-btn-9", resultKey: "Daily Time", nextStepIndex: 10, backBtnId: "back-btn-9", backStepIndex: 8 });
	handleOptionStep({ stepId: "question-step-10", nextBtnId: "next-btn-10", resultKey: "Activity Level", nextStepIndex: 11, backBtnId: "back-btn-10", backStepIndex: 9 });
	handleCheckboxStep({ stepId: "question-step-11", nextBtnId: "next-btn-11", resultKey: "Favorite Activities", nextStepIndex: 12, backBtnId: "back-btn-11", backStepIndex: 10 });
	handleCheckboxStep({ stepId: "question-step-12", nextBtnId: "next-btn-12", resultKey: "Available Resources", nextStepIndex: 13, backBtnId: "back-btn-12", backStepIndex: 11 });

	document.getElementById("next-btn-12").addEventListener("click", () => {
		const formatted = {
			goal: answers["Motivation"],
			gender: answers["Gender"],
			age: answers["Age"],
			// Altura
			height_unit: isNaN(answers["Height"]) ? "imperial" : "metric",
			height_cm: !isNaN(answers["Height"]) ? answers["Height"] : undefined,
			height_ft: isNaN(answers["Height"]) ? Math.floor(answers["Height"] / 12) : undefined,
			height_in: isNaN(answers["Height"]) ? answers["Height"] % 12 : undefined,
			// Peso actual
			weight_unit: document.querySelector("#weight-toggle .toggle-btn.active")?.dataset.unit || "kg",
			current_weight: answers["Current Weight"],
			goal_weight: answers["Goal Weight"],
			speed: answers["Goal Speed"],
			days_per_week: answers["Training Days"],
			time_available: answers["Daily Time"],
			activity_level: answers["Activity Level"],
			favorite_styles: answers["Favorite Activities"],
			equipment: answers["Available Resources"]
		};

		fetch("/save_onboarding", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formatted),
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					window.location.href = "/results";
				} else {
					console.error("Error saving data:", data.error);
					alert("Oops! Couldn't save your data.");
				}
			})
			.catch(err => {
				console.error("Network error:", err);
				alert("Something went wrong. Try again!");
			});
	});
});
