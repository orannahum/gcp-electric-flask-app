console.log('סקריפט תרשים חיסכון נטען...');

document.addEventListener('DOMContentLoaded', function() {
    function getRandomColor() {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return {
            line: `rgba(${r}, ${g}, ${b}, 1)`,
            fill: `rgba(${r}, ${g}, ${b}, 0.8)`
        };
    }

    function createSavingsChart(diffSavingData) {
        const canvas = document.getElementById('savingsTimeSeriesChart');
        if (!canvas) {
            console.error('לא נמצא אלמנט הקנבס');
            return;
        }

        const colors = {
            // חברת חשמל - Gray
            plan_hevrat_hashmal1_diff: { 
                line: 'rgba(128, 128, 128, 1)',
                fill: 'rgba(128, 128, 128, 0.8)'
            },
            
            // סלקום - Shades of Blue
            plan_cellcom1_diff: { 
                line: 'rgba(0, 114, 188, 1)',
                fill: 'rgba(0, 114, 188, 0.8)'
            },
            plan_cellcom2_diff: { 
                line: 'rgba(0, 159, 227, 1)',
                fill: 'rgba(0, 159, 227, 0.8)'
            },
            plan_cellcm3_diff: { 
                line: 'rgba(0, 85, 140, 1)',
                fill: 'rgba(0, 85, 140, 0.8)'
            },
            plan_cellcom4_diff: { 
                line: 'rgba(65, 182, 230, 1)',
                fill: 'rgba(65, 182, 230, 0.8)'
            },
        
            // פזגז - Orange
            plan_paz1_diff: { 
                line: 'rgba(255, 140, 0, 1)',
                fill: 'rgba(255, 140, 0, 0.8)'
            },
        
            // אלקטרה - Shades of Green
            plan_electra_power1_diff: { 
                line: 'rgba(0, 166, 81, 1)',      
                fill: 'rgba(0, 166, 81, 0.8)'
            },
            plan_electra_power2_diff: { 
                line: 'rgba(34, 197, 94, 1)',     
                fill: 'rgba(34, 197, 94, 0.8)'
            },
            plan_electra_power3_diff: { 
                line: 'rgba(0, 133, 65, 1)',      
                fill: 'rgba(0, 133, 65, 0.8)'
            },
        
            // הוט - Shades of Red
            plan_hot1_diff: { 
                line: 'rgba(237, 28, 36, 1)',     
                fill: 'rgba(237, 28, 36, 0.8)'
            },
            plan_hot2_diff: { 
                line: 'rgba(255, 59, 63, 1)',     
                fill: 'rgba(255, 59, 63, 0.8)'
            },
            plan_hot3_diff: { 
                line: 'rgba(204, 24, 30, 1)',     
                fill: 'rgba(204, 24, 30, 0.8)'
            },
            plan_hot4_diff: { 
                line: 'rgba(255, 99, 71, 1)',     
                fill: 'rgba(255, 99, 71, 0.8)'
            },
            plan_hot5_diff: { 
                line: 'rgba(255, 127, 80, 1)',    
                fill: 'rgba(255, 127, 80, 0.8)'
            },
            plan_hot6_diff: { 
                line: 'rgba(255, 69, 0, 1)',      
                fill: 'rgba(255, 69, 0, 0.8)'
            }
        };

        // const plans_translate_to_hebrew = {
        //     'חברת חשמל': 'plan_hevrat_hashmal1_diff',
        //     'סלקום 1': 'plan_cellcom1_diff',
        //     'סלקום 2': 'plan_cellcom2_diff',
        //     'סלקום 3': 'plan_cellcm3_diff',
        //     'סלקום 4': 'plan_cellcom4_diff',
        //     'פזגז': 'plan_paz1_diff',
        //     'אלקטרה 1': 'plan_electra_power1_diff',
        //     'אלקטרה 2': 'plan_electra_power2_diff',
        //     'אלקטרה 3': 'plan_electra_power3_diff',
        //     'הוט 1': 'plan_hot1_diff',
        //     'הוט 2': 'plan_hot2_diff',
        //     'הוט 3': 'plan_hot3_diff',
        //     'הוט 4': 'plan_hot4_diff',
        //     'הוט 5': 'plan_hot5_diff',
        //     'הוט 6': 'plan_hot6_diff'
        // };
        const translationsElement = document.getElementById('plansTranslations');
        const plans_translate_to_hebrew = JSON.parse(translationsElement.textContent);
        const updated_plans_translate_to_hebrew = Object.entries(plans_translate_to_hebrew).reduce((acc, [key, value]) => {
            acc[value] = `${key}_diff`;
            return acc;
        }, {});

        const datasets = Object.entries(diffSavingData).map(([plan, data]) => {
            const planColors = colors[plan] || getRandomColor();
            const hebrewLabel = Object.keys(updated_plans_translate_to_hebrew).find(key => updated_plans_translate_to_hebrew[key] === plan) || plan.replace('plan_', '').replace('_diff', '');

            return {
                label: hebrewLabel,
                data: Object.entries(data).map(([timestamp, value]) => ({
                    x: new Date(timestamp),
                    y: value
                })),
                borderColor: planColors.line,
                backgroundColor: planColors.fill,
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            };
        });

        const chart = new Chart(canvas, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'right',  // Changed from 'top' to 'right'
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        },
                        align: 'start',    // Added this to align text to the start (right in RTL)
                        rtl: true         // Added this for RTL support
                    },
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw.y.toFixed(2);
                                const sign = value >= 0 ? '+' : '';
                                return `${context.dataset.label}: ${sign}${value}₪`;
                            },
                            title: function(context) {
                                const date = new Date(context[0].raw.x);
                                return date.toLocaleDateString('he-IL', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            parser: 'YYYY-MM-DD HH:mm:ss',
                            tooltipFormat: 'DD-MM-YYYY HH:mm',
                            unit: 'day',
                            displayFormats: {
                                day: 'DD-MM-YYYY'
                            }
                        },
                        title: {
                            display: true,
                            text: 'תאריך'
                        },
                        grid: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: true,
                            drawTicks: true,
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'חיסכון (₪)'
                        },
                        grid: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: true,
                            drawTicks: true,
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2) + '₪';
                            }
                        }
                    }
                }
            }
        });
    }

    const preElement = document.querySelector('pre');
    if (!preElement) {
        console.error('לא נמצא אלמנט pre עם נתוני תוצאות');
        return;
    }

    try {
        const results = JSON.parse(preElement.textContent);
        
        if (!results.diff_saving) {
            console.error('לא נמצאו נתוני diff_saving בתוצאות');
            return;
        }

        createSavingsChart(results.diff_saving);

    } catch (error) {
        console.error('שגיאה בעיבוד הנתונים:', error);
    }
});