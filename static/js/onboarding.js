document.addEventListener("DOMContentLoaded", () => {
	const steps = Array.from(document.querySelectorAll(".welcome-card"));
	let currentStep = 0;
	const answers = {};
	// 🪄 Precargar respuestas si estamos editando
	if (editMode && existingData) {
		answers["Motivation"] = existingData.goal;
		answers["Gender"] = existingData.gender;
		answers["Age"] = existingData.age;
		answers["Height"] = existingData.height_cm || (existingData.height_ft * 12 + existingData.height_in);
		answers["Current Weight"] = existingData.current_weight;
		answers["Goal Weight"] = existingData.goal_weight;
		answers["Goal Speed"] = existingData.speed;
		answers["Training Days"] = existingData.days_per_week;
		answers["Daily Time"] = existingData.time_available;
		answers["Activity Level"] = existingData.activity_level;

		const progressBar = document.getElementById("progress-bar");
		const TOTAL_SEGMENTS = 11; // actual total after removing steps
		for (let i = 0; i < TOTAL_SEGMENTS; i++) {
			const segment = document.createElement("div");
			segment.classList.add("progress-segment");
			progressBar.appendChild(segment);
		}
		const segments = document.querySelectorAll(".progress-segment");

		function updateProgress(index) {
			segments.forEach((seg, i) => {
				seg.classList.toggle("active", i < index);
			});
		}

		function showStep(step) {
			const nextStep = typeof step === "number" ? steps[step] : document.getElementById(step);
			steps[currentStep].classList.add("hidden");
			nextStep.classList.remove("hidden");
			currentStep = typeof step === "number" ? step : steps.indexOf(nextStep);
			updateProgress(currentStep);
		}

		function handleBackButton(id, toIndex) {
			const btn = document.getElementById(id);
			if (btn) btn.addEventListener("click", () => showStep(toIndex));
		}

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

			// 🪄 si ya hay valor precargado, marcamos botón y activamos Next
			if (editMode && answers[resultKey]) {
				const btnToSelect = step.querySelector(`.option-btn[data-value="${answers[resultKey]}"]`);
				if (btnToSelect) {
					btnToSelect.classList.add("selected");
					selectedValue = answers[resultKey];
					nextBtn.disabled = false;
				}
			}
		}

		function handleInputStep({ inputId, nextBtnId, resultKey, min, max, nextStepIndex, backBtnId, backStepIndex }) {
			const input = document.getElementById(inputId);
			const nextBtn = document.getElementById(nextBtnId);

			// 👉 validación normal cuando escribe
			input.addEventListener("input", () => {
				const val = parseInt(input.value);
				nextBtn.disabled = isNaN(val) || val < min || val > max;
			});

			// 👉 guardar y avanzar
			nextBtn.addEventListener("click", () => {
				const val = parseInt(input.value);
				if (!isNaN(val) && val >= min && val <= max) {
					answers[resultKey] = val;
					showStep(nextStepIndex);
				}
			});

			// 🪄 auto-habilitar si ya hay respuesta cargada
			if (editMode && existingData && existingData[resultKey.toLowerCase().replaceAll(" ", "_")]) {
				const precargado = existingData[resultKey.toLowerCase().replaceAll(" ", "_")];
				input.value = precargado;
				nextBtn.disabled = false;
			}

			handleBackButton(backBtnId, backStepIndex);
		}


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

			function validate() {
				const isValid = validation[currentUnit]();
				nextBtn.disabled = !isValid;
			}

			unitNames.forEach(unit => {
				inputFields[unit].forEach(id => {
					const input = document.getElementById(id);
					input.addEventListener("input", validate);
				});
			});

			btns.forEach(btn => {
				btn.addEventListener("click", () => toggleUnit(btn.dataset.unit));
			});
			// 🪄 Si estamos editando y ya hay datos, intentamos validar automáticamente
			if (editMode && existingData) {
				validate();
			}


			nextBtn.addEventListener("click", () => {
				answers[resultKey] = validation[currentUnit](true);
				showStep(nextStepIndex);
			});

			handleBackButton(backBtnId, backStepIndex);
			toggleUnit(currentUnit); // inicialización por defecto

			// 🪄 Si estamos editando, activamos la unidad correcta, llenamos los inputs y validamos
			if (editMode && existingData) {
				const keyBase = resultKey.toLowerCase().replace(" ", "_");
				let unit = null;

				if (keyBase === "height") {
					unit = existingData.height_unit || (existingData.height_cm ? "metric" : "imperial");
				} else if (keyBase === "current_weight" || keyBase === "goal_weight") {
					unit = existingData.weight_unit || (existingData[keyBase] < 250 ? "kg" : "lbs");
				}

				if (unit) {
					toggleUnit(unit); // 🔁 cambia visualmente
					// Esperamos un pelín a que se muestre el grupo correcto y luego seteamos los valores
					setTimeout(() => {
						if (keyBase === "height") {
							if (unit === "imperial") {
								document.getElementById("feet-input").value = existingData.height_ft;
								document.getElementById("inches-input").value = existingData.height_in;
							} else {
								document.getElementById("cm-input").value = existingData.height_cm;
							}
							answers[resultKey] = existingData.height_cm || (existingData.height_ft * 12 + existingData.height_in);
						}

						if (keyBase === "current_weight") {
							if (unit === "lbs") {
								document.getElementById("weight-input-lbs").value = existingData.current_weight;
							} else {
								document.getElementById("weight-input-kg").value = existingData.current_weight;
							}
							answers[resultKey] = existingData.current_weight;
						}

						if (keyBase === "goal_weight") {
							if (unit === "lbs") {
								document.getElementById("goal-weight-input-lbs").value = existingData.goal_weight;
							} else {
								document.getElementById("goal-weight-input-kg").value = existingData.goal_weight;
							}
							answers[resultKey] = existingData.goal_weight;
						}

						// 🔥 Disparar validación visual
						inputFields[unit].forEach(id => {
							const input = document.getElementById(id);
							if (input) input.dispatchEvent(new Event("input", { bubbles: true }));
						});
						validate();
					}, 50);

				}
			}


		}

		document.getElementById("start-btn").addEventListener("click", () => showStep(1));

		handleOptionStep({ stepId: "question-step-1", nextBtnId: "next-btn", resultKey: "Motivation", nextStepIndex: 2 });
		handleOptionStep({ stepId: "question-step-2", nextBtnId: "next-btn-2", resultKey: "Gender", nextStepIndex: 3, backBtnId: "back-btn-2", backStepIndex: 1 });
		handleInputStep({ inputId: "age-input", nextBtnId: "next-btn-3", resultKey: "Age", min: 13, max: 120, nextStepIndex: 4, backBtnId: "back-btn-3", backStepIndex: 2 });

		handleToggleUnitInputStep({
			toggleId: "height-toggle",
			unitBtnsSelector: ".toggle-btn",
			inputGroups: { imperial: "imperial-inputs", metric: "metric-inputs" },
			inputFields: { imperial: ["feet-input", "inches-input"], metric: ["cm-input"] },
			unitNames: ["imperial", "metric"],
			validation: {
				imperial: (ret = false) => {
					const feet = parseInt(document.getElementById("feet-input").value);
					const inches = parseInt(document.getElementById("inches-input").value);
					const valid = !isNaN(feet) && feet >= 3 && feet <= 8 && !isNaN(inches) && inches >= 0 && inches <= 11;
					return ret && valid ? (feet * 12 + inches) : valid;
				},
				metric: (ret = false) => {
					const cm = parseInt(document.getElementById("cm-input").value);
					const valid = !isNaN(cm) && cm >= 90 && cm <= 250;
					return ret && valid ? cm : valid;
				}
			},
			resultKey: "Height",
			nextBtnId: "next-btn-4",
			nextStepIndex: 5,
			backBtnId: "back-btn-4",
			backStepIndex: 3
		});


		handleToggleUnitInputStep({
			toggleId: "weight-toggle",
			unitBtnsSelector: ".toggle-btn",
			inputGroups: { lbs: "lbs-input-group", kg: "kg-input-group" },
			inputFields: { lbs: ["weight-input-lbs"], kg: ["weight-input-kg"] },
			unitNames: ["lbs", "kg"],
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
			},
			resultKey: "Current Weight",
			nextBtnId: "next-btn-5",
			nextStepIndex: 6,
			backBtnId: "back-btn-5",
			backStepIndex: 4
		});


		handleToggleUnitInputStep({
			toggleId: "goal-weight-toggle",
			unitBtnsSelector: ".toggle-btn",
			inputGroups: { lbs: "goal-lbs-input-group", kg: "goal-kg-input-group" },
			inputFields: { lbs: ["goal-weight-input-lbs"], kg: ["goal-weight-input-kg"] },
			unitNames: ["lbs", "kg"],
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
			},
			resultKey: "Goal Weight",
			nextBtnId: "next-btn-6",
			nextStepIndex: 7,
			backBtnId: "back-btn-6",
			backStepIndex: 5
		});

		handleOptionStep({ stepId: "question-step-7", nextBtnId: "next-btn-7", resultKey: "Goal Speed", nextStepIndex: 8, backBtnId: "back-btn-7", backStepIndex: 6 });
		handleOptionStep({ stepId: "question-step-8", nextBtnId: "next-btn-8", resultKey: "Training Days", nextStepIndex: 9, backBtnId: "back-btn-8", backStepIndex: 7 });
		handleOptionStep({ stepId: "question-step-9", nextBtnId: "next-btn-9", resultKey: "Daily Time", nextStepIndex: 10, backBtnId: "back-btn-9", backStepIndex: 8 });


		handleOptionStep({ stepId: "question-step-10", nextBtnId: "next-btn-10", resultKey: "Activity Level", nextStepIndex: "final-step", backBtnId: "back-btn-10", backStepIndex: 9 });


		document.getElementById("next-btn-final").addEventListener("click", () => {
			const formatted = {
				goal: answers["Motivation"],
				gender: answers["Gender"],
				age: answers["Age"],
				height_unit: isNaN(answers["Height"]) ? "imperial" : "metric",
				height_cm: !isNaN(answers["Height"]) ? answers["Height"] : undefined,
				height_ft: isNaN(answers["Height"]) ? Math.floor(answers["Height"] / 12) : undefined,
				height_in: isNaN(answers["Height"]) ? answers["Height"] % 12 : undefined,
				current_weight: answers["Current Weight"],
				goal_weight: answers["Goal Weight"],
				speed: answers["Goal Speed"],
				days_per_week: answers["Training Days"],
				time_available: answers["Daily Time"],
				activity_level: answers["Activity Level"]
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


	}

});
