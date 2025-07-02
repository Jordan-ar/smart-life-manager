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
	document.getElementById("signup-btn").addEventListener("click", () => {
		window.location.href = "onboarding.html";
	});
});

// Funcions por profile picture
function toggleUploadMenu() {
	document.getElementById('uploadMenu').style.display = 'block';
	document.getElementById('uploadOverlay').style.display = 'block';
}

function closeUploadMenu() {
	document.getElementById('uploadMenu').style.display = 'none';
	document.getElementById('uploadOverlay').style.display = 'none';
}

function openCamera() {
	const video = document.createElement('video');
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	const modal = document.createElement('div');
	modal.classList.add('camera-modal');

	const captureBtn = document.createElement('button');
	captureBtn.textContent = 'Capture';
	captureBtn.className = 'btn full-btn primary';

	const closeBtn = document.createElement('button');
	closeBtn.textContent = 'Cancel';
	closeBtn.className = 'btn full-btn secondary';

	modal.appendChild(video);
	modal.appendChild(captureBtn);
	modal.appendChild(closeBtn);
	document.body.appendChild(modal);

	// Start camera
	navigator.mediaDevices.getUserMedia({ video: true })
		.then((stream) => {
			video.srcObject = stream;
			video.play();

			captureBtn.onclick = () => {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				video.srcObject.getTracks().forEach(track => track.stop());

				const imageData = canvas.toDataURL('image/png');
				uploadImage(imageData);
				document.body.removeChild(modal);
			};

			closeBtn.onclick = () => {
				video.srcObject.getTracks().forEach(track => track.stop());
				document.body.removeChild(modal);
			};
		})
		.catch(err => {
			alert("Camera access was denied or not available.");
			console.error(err);
		});
}

function uploadImage(imageData) {
	fetch('/upload-profile-photo', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ image: imageData })
	})
	.then(res => res.json())
	.then(data => {
		if (data.success) {
			document.getElementById('profile-pic').src = data.path + '?t=' + new Date().getTime();
		} else {
			alert('Failed to upload image.');
		}
	})
	.catch(err => {
		console.error("Upload error:", err);
		alert('Error uploading photo.');
	});
}

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
