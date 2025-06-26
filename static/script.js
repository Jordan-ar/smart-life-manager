// This script toggles the visibility of the password input field
document.addEventListener('DOMContentLoaded', () => {
	const toggleBtn = document.querySelector('.toggle-password');
	const passwordInput = document.getElementById('password');
	const icon = toggleBtn.querySelector('i');

	toggleBtn.addEventListener('click', () => {
		const ifHidden = passwordInput.type === 'password';
		passwordInput.type = ifHidden ? 'text' : 'password';
		icon.classList.toggle('fa-eye');
		icon.classList.toggle('fa-eye-slash');
	});
});

