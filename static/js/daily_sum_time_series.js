// קבלת הנתונים מהתוצאות
const dailyData = JSON.parse(document.getElementById('dailyData').textContent);

// עיבוד הנתונים עבור Chart.js
const dailyConsumptionData = Object.entries(dailyData).map(([date, value]) => ({
    x: date,
    y: value
}));

// מיון הנתונים לפי תאריך
dailyConsumptionData.sort((a, b) => moment(a.x).valueOf() - moment(b.x).valueOf());

// יצירת התרשים
const ctx = document.getElementById('dailyConsumptionChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'צריכה יומית (קוט"ש)',
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
                display: false  // Changed from true to false to remove the title
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `צריכה: ${context.parsed.y.toFixed(2)} קוט"ש`;
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
                        day: 'DD-MM-YYYY'
                    }
                },
                title: {
                    display: true,
                    text: 'תאריך'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'צריכה (קוט"ש)'
                }
            }
        }
    }
});