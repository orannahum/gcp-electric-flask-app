console.log('טוען את סקריפט התרשים...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM נטען');

    function getColorForValue(value, minValue, maxValue) {
        // חישוב אחוז בין מינימום למקסימום
        const percentage = (value - minValue) / (maxValue - minValue);
        
        // גרדיאנט ישיר מירוק לאדום
        const r = Math.round(255 * percentage);
        const g = Math.round(255 * (1 - percentage));
        const b = 0;
        
        return `rgba(${r}, ${g}, ${b}, 0.4)`; // שקוף
    }

    function createChart(hourlyData) {
        console.log('יוצר תרשים עם הנתונים:', hourlyData);

        // מציאת הקנבס
        const canvas = document.getElementById('hourlyConsumptionChart');
        if (!canvas) {
            console.error('אלמנט הקנבס לא נמצא');
            return;
        }

        // הכנת הנתונים
        const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
        const values = Array(24).fill(0);

        // מילוי הערכים
        Object.entries(hourlyData).forEach(([hour, data]) => {
            const hourIndex = parseInt(hour);
            if (hourIndex >= 0 && hourIndex < 24) {
                values[hourIndex] = data['Consumption (kWh)'];
            }
        });

        // מציאת ערכי מינימום ומקסימום (לא כולל אפסים)
        const nonZeroValues = values.filter(v => v > 0);
        const minValue = Math.min(...nonZeroValues);
        const maxValue = Math.max(...values);

        // יצירת מערך צבעי רקע
        const backgroundColors = values.map(value => 
            value === 0 ? 'rgba(200, 200, 200, 0.2)' : getColorForValue(value, minValue, maxValue)
        );

        // יצירת מערך צבעי גבול (מעט כהים יותר)
        const borderColors = values.map(value => 
            value === 0 ? 'rgba(200, 200, 200, 0.3)' : 
            getColorForValue(value, minValue, maxValue).replace('0.4', '0.6')
        );

        // יצירת התרשים
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [{
                    label: 'צריכת חשמל (קוט"ש)',
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: false  // Changed from true to false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'צריכה (קוט"ש)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'שעה ביום'
                        }
                    }
                }
            }
        });

        // הוספת מקרא
        const legendHtml = `
            <div style="margin-top: 10px; text-align: center; font-size: 12px; color: #666;">
                <div style="display: inline-block; margin: 0 10px;">
                    <span style="display: inline-block; width: 20px; height: 20px; background: rgba(0, 255, 0, 0.4); vertical-align: middle; border: 1px solid rgba(0, 255, 0, 0.6);"></span>
                    <span style="margin-right: 5px;">צריכה נמוכה</span>
                </div>
                <div style="display: inline-block; margin: 0 10px;">
                    <span style="display: inline-block; width: 20px; height: 20px; background: rgba(255, 0, 0, 0.4); vertical-align: middle; border: 1px solid rgba(255, 0, 0, 0.6);"></span>
                    <span style="margin-right: 5px;">צריכה גבוהה</span>
                </div>
            </div>
        `;
        
        // הוספת המקרא אחרי מיכל התרשים
        const chartContainer = canvas.parentElement;
        chartContainer.insertAdjacentHTML('afterend', legendHtml);
    }

    // מציאת אלמנט ה-pre עם התוצאות
    const preElement = document.querySelector('pre');
    if (!preElement) {
        console.error('לא נמצא אלמנט pre עם נתוני תוצאות');
        return;
    }

    try {
        // פענוח נתוני ה-JSON
        const results = JSON.parse(preElement.textContent);
        console.log('תוצאות מפוענחות:', results);

        // בדיקה לנתוני hourly_agg
        if (!results.hourly_agg) {
            console.error('לא נמצאו נתוני hourly_agg בתוצאות');
            return;
        }

        // יצירת התרשים
        createChart(results.hourly_agg);

    } catch (error) {
        console.error('שגיאה בעיבוד הנתונים:', error);
    }
});