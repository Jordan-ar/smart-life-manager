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
	togglePhotoOptions(); // cerrar menú después
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
