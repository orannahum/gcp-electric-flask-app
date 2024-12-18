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
                
                <!-- Current Savings Column -->
                <td class="${savings > 0 ? 'positive-savings' : savings < 0 ? 'negative-savings' : ''}">
                    ${currentPlanPrice !== null ? `₪ ${formatNumber(savings)}` : 'לא זמין'}
                </td>

                <!-- Yearly Savings Estimate Column -->
                <td class="${yearlySavings > 0 ? 'positive-savings' : yearlySavings < 0 ? 'negative-savings' : ''}">
                    ${currentPlanPrice !== null ? `₪ ${formatNumber(yearlySavings)}` : 'לא זמין'}
                </td>

                <!-- Three Year Savings Estimate Column -->
                <td class="${threeYearSavings > 0 ? 'positive-savings' : threeYearSavings < 0 ? 'negative-savings' : ''}">
                    ${currentPlanPrice !== null ? `₪ ${formatNumber(threeYearSavings)}` : 'לא זמין'}
                </td>
                
                <!-- Contact Links -->
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

        console.log('Table created successfully');

    } catch (error) {
        console.error('Error creating table:', error);
        const tableContainer = document.getElementById('finalPlansTable');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="error-message">
                    שגיאה ביצירת הטבלה: ${error.message}
                    <br>
                    אנא בדקו את קונסול הדפדפן לפרטים נוספים.
                </div>
            `;
        }
    }
});