document.addEventListener('DOMContentLoaded', () => {
	// Create calendar
	const calendar = document.getElementById('calendar');

	const daysInMonth = 30;
	const activeDays = [1, 3, 4, 7, 10, 13, 14, 15, 20, 22, 25, 28]; // Mockup

	for (let i = 1; i <= daysInMonth; i++) {
		const day = document.createElement('div');
		day.textContent = i;
		if (activeDays.includes(i)) {
			day.classList.add('active-day');
		}
		calendar.appendChild(day);
	}

	// Trends Chart
	const trendsChart = new Chart(document.getElementById('trendsChart').getContext('2d'), {
		type: 'bar',
		data: {
			labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			datasets: [{
				label: 'Minutes Trained',
				data: [30, 40, 60, 20, 45, 0, 25],
				backgroundColor: '#ff7c00'
			}]
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						color: '#ccc'
					}
				},
				x: {
					ticks: {
						color: '#ccc'
					}
				}
			},
			plugins: {
				legend: {
					labels: {
						color: '#ccc'
					}
				}
			}
		}
	});

	// Toggles Functionality
	const toggleBtns = document.querySelectorAll('.toggle-btn');
	toggleBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			toggleBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');

			// Mockup Data
			const label = btn.textContent.trim().toLowerCase();
			if (label === 'day') {
				trendsChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
				trendsChart.data.datasets[0].data = [30, 40, 60, 20, 45, 0, 25];
			} else if (label === 'week') {
				trendsChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
				trendsChart.data.datasets[0].data = [180, 220, 240, 150];
			} else if (label === 'month') {
				trendsChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
				trendsChart.data.datasets[0].data = [800, 750, 900, 650, 1000];
			}
			trendsChart.update();
		});
	});

	// Goal Progress
	const goalChart = new Chart(document.getElementById('goalChart').getContext('2d'), {
		type: 'doughnut',
		data: {
			labels: ['Completed', 'Remaining'],
			datasets: [{
				data: [75, 25],
				backgroundColor: ['#ff7c00', '#ccc'],
				borderWidth: 0
			}]
		},
		options: {
			cutout: '65%',
			plugins: {
				legend: {
					display: false
				}
			}
		}
	});
});
