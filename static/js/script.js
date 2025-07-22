// Toggle password visibility for all password fields

document.addEventListener("DOMContentLoaded", () => {
	const toggleButtons = document.querySelectorAll(".toggle-password");

	toggleButtons.forEach((btn) => {
		const input = btn.previousElementSibling;
		const icon = btn.querySelector("i");

		btn.addEventListener("click", () => {
			const isHidden = input.type === "password";
			input.type = isHidden ? "text" : "password";
			icon.classList.toggle("fa-eye", !isHidden);
			icon.classList.toggle("fa-eye-slash", isHidden);
		});
	});

	// Sign Up: Confirm password match validation
	const form = document.querySelector("form");
	if (form && document.getElementById("confirm-password")) {
		form.addEventListener("submit", (e) => {
			const password = document.getElementById("password").value;
			const confirm = document.getElementById("confirm-password").value;

			if (password !== confirm) {
				e.preventDefault();
				alert("Passwords do not match. Please try again.");
			}
		});
	}

	// Sign Up: Handle button click
	const checkbox = document.getElementById('termsCheckbox');
	const googleBtn = document.getElementById('googleSignUpBtn');

	if (checkbox && googleBtn) {
		checkbox.addEventListener('change', function () {
			if (this.checked) {
				googleBtn.classList.remove('disabled');
				const href = googleBtn.getAttribute('data-href');
				if (href) {
					googleBtn.setAttribute('href', href);
				}
			} else {
				googleBtn.classList.add('disabled');
				googleBtn.removeAttribute('href');
			}
		});
	}
});
// functions for feedback modal
function openFeedbackModal() {
	document.getElementById('feedback-modal').style.display = 'flex';
	document.getElementById('uploadOverlay').style.display = 'block';
}

// Functions for terms and conditions modal
function closeFeedbackModal() {
	document.getElementById('feedback-modal').style.display = 'none';
	document.getElementById('uploadOverlay').style.display = 'none';
}

function openTermsModal() {
	document.getElementById("modalOverlay").style.display = "block";
	document.getElementById("termsModal").style.display = "flex";
}
function closeTermsModal() {
	document.getElementById("modalOverlay").style.display = "none";
	document.getElementById("termsModal").style.display = "none";
}

// functions for profile picture
function openCameraModal() {
	const modal = document.getElementById("cameraModal");
	modal.classList.remove("hidden");

	const video = document.getElementById("video");
	navigator.mediaDevices.getUserMedia({ video: true })
		.then(stream => {
			video.srcObject = stream;
		})
		.catch(err => {
			alert("Could not access the camera. Please check permissions.");
			closeCameraModal();
		});
}
function closeCameraModal() {
	const modal = document.getElementById("cameraModal");
	modal.classList.add("hidden");

	const video = document.getElementById("video");
	const stream = video.srcObject;
	if (stream) {
		const tracks = stream.getTracks();
		tracks.forEach(track => track.stop());
	}
	video.srcObject = null;
}
function takePhoto() {
	const video = document.getElementById("video");
	const canvas = document.getElementById("canvas");
	const context = canvas.getContext("2d");

	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0, canvas.width, canvas.height);

	const dataURL = canvas.toDataURL("image/png");
	document.getElementById("profile-pic").src = dataURL;
	uploadImageToServer(dataURL);

	togglePhotoOptions();
	closeCameraModal();
}

document.getElementById('profileImageInput').addEventListener('change', function () {
	const file = this.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			const imageData = e.target.result;
			document.getElementById("profile-pic").src = imageData;
			uploadImageToServer(imageData);
		};
		reader.readAsDataURL(file);
	}
});

function togglePhotoOptions() {
	const options = document.getElementById('photo-options');
	options.classList.toggle('hidden');
}
function triggerFileUpload() {
	document.getElementById('profileImageInput').click();
	togglePhotoOptions();
}

function uploadImageToServer(base64Image) {
	fetch("/upload-profile-photo", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ image: base64Image })
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				document.getElementById("profile-pic").src = data.path + "?t=" + new Date().getTime();
			} else {
				alert("Error uploading image: " + data.error);
			}
		})
		.catch(err => {
			console.error("Upload failed:", err);
			alert("Could not upload image.");
		});
}

document.addEventListener("DOMContentLoaded", () => {
	fetch("/dashboard-data")
		.then(res => res.json())
		.then(data => {
			console.log("📊 Dashboard Data:", data);
			if (!data.success) return;

			// 1. Update Progress Circle
			const circle = document.querySelector(".circle-progress");
			const percent = data.percentage_today;
			circle.style.background = `conic-gradient(#ff7f50 ${percent * 3.6}deg, #e6e6e6 0deg)`;
			circle.querySelector("h2").textContent = `${percent}%`;

			// 2. Update Today's Activity
			const calorieElem = document.getElementById("calories-today");
			if (calorieElem) calorieElem.textContent = `${data.calories_today} kcal`;

			const listElem = document.getElementById("today-exercises-list");
			if (listElem && Array.isArray(data.today_exercises)) {
				listElem.innerHTML = "";
				data.today_exercises.slice(0, 5).forEach(ex => {
					const li = document.createElement("li");
					li.textContent = ex;
					listElem.appendChild(li);
				});
			}

			// 3. Update Overall Calories
			const totalElem = document.getElementById("calories-total");
			if (totalElem) totalElem.textContent = `${data.calories_total} kcal`;

			// 4. Update Weight Progress Circle
			const weightCircle = document.querySelector(".circle-weight");
			if (weightCircle) {
				weightCircle.style.background = `conic-gradient(#32cd32 ${data.weight_progress * 3.6}deg, #e6e6e6 0deg)`;
				weightCircle.querySelector("h2").textContent = `${data.weight_progress}%`;
			}

			// 5. Update Weekly Streak Stars
			const starsContainer = document.getElementById("weekly-stars");
			if (starsContainer) {
				starsContainer.innerHTML = "";
				for (let i = 1; i <= data.streak_target; i++) {
					const star = document.createElement("i");
					star.classList.add("fas", "fa-star");
					if (i <= data.streak_count) {
						star.classList.add("filled");
					}
					starsContainer.appendChild(star);
				}
			}
		})
		.catch(err => console.error("Failed to load dashboard data", err));
});
