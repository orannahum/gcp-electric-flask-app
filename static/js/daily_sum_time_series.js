// Get the data from the results
const dailyData = JSON.parse(document.getElementById('dailyData').textContent);

// Process the data for Chart.js
const dailyConsumptionData = Object.entries(dailyData).map(([date, value]) => ({
    x: date,
    y: value
}));

// Sort the data by date
dailyConsumptionData.sort((a, b) => moment(a.x).valueOf() - moment(b.x).valueOf());

// Create the chart
const ctx = document.getElementById('dailyConsumptionChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Daily Consumption (kWh)',
            data: dailyConsumptionData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Daily Energy Consumption'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Consumption: ${context.parsed.y.toFixed(2)} kWh`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'YYYY-MM-DD'
                    }
                },
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Consumption (kWh)'
                }
            }
        }
    }
});