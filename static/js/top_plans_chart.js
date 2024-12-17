document.addEventListener('DOMContentLoaded', function() {
    console.log('טוען את סקריפט התרשים...');

    function translatePlanName(plan, translations) {
        return translations[plan] || plan;
    }

    function createPlansChart(finalTopPlans, translations) {
        console.log('יוצר תרשים של המסלולים:', finalTopPlans);

        const canvas = document.getElementById('topPlansChart');
        if (!canvas) {
            console.error('אלמנט הקנבס לא נמצא');
            return;
        }

        // הכנת הנתונים בסדר הפוך
        const top10Plans = Object.entries(finalTopPlans).slice(0, 10).reverse();
        const labels = top10Plans.map(([_, data]) => translatePlanName(data.plan, translations));
        const prices = top10Plans.map(([_, data]) => data['price(ILS)']);

        // יצירת התרשים
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'מחיר (ILS)',
                    data: prices,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'עשרת המסלולים המובילים לפי מחיר'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'מחיר (ILS)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'מסלול'
                        }
                    }
                }
            }
        });
    }

    // פענוח נתוני ה-JSON מתוך ה-HTML
    const plansDataElement = document.querySelector('#plansData');
    const translationsElement = document.querySelector('#plansTranslations');

    if (!plansDataElement || !translationsElement) {
        console.error('אלמנט הנתונים של התכניות או התרגומים לא נמצא');
        return;
    }

    try {
        const results = JSON.parse(plansDataElement.textContent);
        const translations = JSON.parse(translationsElement.textContent);
        createPlansChart(results, translations);
    } catch (error) {
        console.error('שגיאה בניתוח נתוני JSON:', error);
    }
});
