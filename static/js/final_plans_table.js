document.addEventListener('DOMContentLoaded', function() {
    console.log('Script started');
    try {
        const translationsElement = document.getElementById('plansTranslations');
        const plans_translate_to_hebrew = JSON.parse(translationsElement.textContent);
        
        const plansDataElement = document.getElementById('plansData');
        const clientPlanElement = document.getElementById('clientPlan');
        const tableContainer = document.getElementById('finalPlansTable');
        const resultsData = JSON.parse(document.getElementById('resultsData').textContent);
        
        console.log('Elements found:', {
            plansDataElement: !!plansDataElement,
            clientPlanElement: !!clientPlanElement,
            tableContainer: !!tableContainer,
            resultsData: !!resultsData
        });

        if (!plansDataElement || !clientPlanElement || !tableContainer || !translationsElement || !resultsData) {
            throw new Error('Required elements not found');
        }

        const plansData = JSON.parse(plansDataElement.textContent);
        const clientPlan = JSON.parse(clientPlanElement.textContent);
        const numDays = resultsData.client_info.num_days;

        console.log('Raw data:', {
            plansData,
            clientPlan,
            numDays
        });

        const plansArray = Object.values(plansData)
            .filter(item => item && item.plan && item.plan !== "Consumption (kWh)")
            .map(item => ({
                plan: item.plan,
                planHebrew: plans_translate_to_hebrew[item.plan] || item.plan,
                price: parseFloat(item['price(ILS)']) || 0
            }))
            .sort((a, b) => a.price - b.price);

        console.log('Processed plans array:', plansArray);

        // Create Table
        const table = document.createElement('table');
        table.className = 'plans-table';
        table.dir = 'rtl';

        const header = `
            <thead>
                <tr>
                    <th>דירוג</th>
                    <th>שם תוכנית</th>
                    <th>חיסכון לעומת חברת חשמל</th>
                    <th>אומדן חסכון לשנה</th>
                    <th>אומדן חסכון ל-3 שנים</th>
                    <th>יצירת קשר</th>
                </tr>
            </thead>
        `;
        table.innerHTML = header;

        const tbody = document.createElement('tbody');

        const currentPlanData = plansArray.find(plan => plan.plan === clientPlan);
        const currentPlanPrice = currentPlanData ? currentPlanData.price : null;

        console.log('Current plan price:', currentPlanPrice);

        plansArray.forEach((plan, index) => {
            const row = document.createElement('tr');
            const isCurrentPlan = plan.plan === clientPlan;
            
            if (isCurrentPlan) {
                row.classList.add('current-plan-row');
            }

            let savings = 0;
            let yearlySavings = 0;
            let threeYearSavings = 0;

            if (currentPlanPrice !== null && !isNaN(currentPlanPrice) && !isNaN(plan.price)) {
                savings = currentPlanPrice - plan.price;
                yearlySavings = (savings * 365) / numDays;
                threeYearSavings = yearlySavings * 3;
            }

            const formatNumber = (num) => {
                if (isNaN(num)) return 'לא זמין';
                return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };

            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="${isCurrentPlan ? 'current-plan' : ''}">${plan.planHebrew}</td>
                <td class="${savings > 0 ? 'positive-savings' : savings < 0 ? 'negative-savings' : ''}">
                    ${currentPlanPrice !== null ? `₪ ${formatNumber(savings)}` : 'לא זמין'}
                </td>
                <td class="${yearlySavings > 0 ? 'positive-savings' : yearlySavings < 0 ? 'negative-savings' : ''}">
                    ${currentPlanPrice !== null ? `₪ ${formatNumber(yearlySavings)}` : 'לא זמין'}
                </td>
                <td class="${threeYearSavings > 0 ? 'positive-savings' : threeYearSavings < 0 ? 'negative-savings' : ''}">
                    ${currentPlanPrice !== null ? `₪ ${formatNumber(threeYearSavings)}` : 'לא זמין'}
                </td>
                <td>
                    <div class="contact-links">
                        <a href="#" class="contact-link company-link">יצירת קשר</a>
                        <br>
                        <a href="#" class="contact-link rep-link">לחזרת נציג</a>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);

        // Create Chart
        const canvas = document.getElementById('topPlansChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Clear the canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate savings for each plan
            const plansWithSavings = plansArray.map(plan => ({
                ...plan,
                savings: currentPlanPrice !== null ? currentPlanPrice - plan.price : 0
            }));

            // Sort by savings (highest to lowest) and take top 10
            const top10Plans = plansWithSavings
                .sort((a, b) => b.savings - a.savings)
                .slice(0, 10)
                .reverse();

            const labels = top10Plans.map(plan => plan.planHebrew);
            const savings = top10Plans.map(plan => plan.savings);

            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'חסכון (ILS)',
                        data: savings,
                        backgroundColor: savings.map(value => 
                            value > 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
                        ),
                        borderColor: savings.map(value => 
                            value > 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
                        ),
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
                            labels: {
                                color: 'black',
                                font: {
                                    family: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
                                    size: 14
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'עשרת המסלולים המובילים לפי חסכון',
                            color: 'black',
                            font: {
                                family: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'black',
                                drawBorder: true,
                                borderColor: 'black'
                            },
                            ticks: {
                                color: 'black',
                                font: {
                                    family: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
                                },
                                callback: function(value) {
                                    return '₪' + value.toFixed(2);
                                }
                            },
                            title: {
                                display: true,
                                text: 'חסכון (ILS)',
                                color: 'black',
                                font: {
                                    family: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
                                    weight: 'bold'
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'black',
                                drawBorder: true,
                                borderColor: 'black'
                            },
                            ticks: {
                                color: 'black',
                                font: {
                                    family: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
                                }
                            }
                        }
                    },
                    backgroundColor: 'white'
                }
            });
        }

        console.log('Table and chart created successfully');

    } catch (error) {
        console.error('Error creating visualizations:', error);
        const tableContainer = document.getElementById('finalPlansTable');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="error-message">
                    שגיאה ביצירת הטבלה והתרשים: ${error.message}
                    <br>
                    אנא בדקו את קונסול הדפדפן לפרטים נוספים.
                </div>
            `;
        }
    }
});