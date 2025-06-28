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
