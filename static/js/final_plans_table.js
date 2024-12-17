document.addEventListener('DOMContentLoaded', function() {
    console.log('Script started');
    try {
        const translationsElement = document.getElementById('plansTranslations');
        const plans_translate_to_hebrew = JSON.parse(translationsElement.textContent);
        
        const plansDataElement = document.getElementById('plansData');
        const clientPlanElement = document.getElementById('clientPlan');
        const tableContainer = document.getElementById('finalPlansTable');
        
        console.log('Elements found:', {
            plansDataElement: !!plansDataElement,
            clientPlanElement: !!clientPlanElement,
            tableContainer: !!tableContainer
        });

        if (!plansDataElement || !clientPlanElement || !tableContainer || !translationsElement) {
            throw new Error('Required elements not found');
        }

        const plansData = JSON.parse(plansDataElement.textContent);
        const clientPlan = JSON.parse(clientPlanElement.textContent);

        console.log('Parsed data:', { plansData, clientPlan });

        const plansArray = Object.values(plansData)
            .filter(item => item && item.plan && item.plan !== "Consumption (kWh)")
            .map(item => ({
                plan: item.plan,
                planHebrew: plans_translate_to_hebrew[item.plan] || item.plan,
                price: item['price(ILS)']
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
                    <th>מחיר החשמל מתחילת המדידה</th>
                    <th>חיסכון לעומת חברת חשמל</th>
                    <th>יצירת קשר</th>
                </tr>
            </thead>
        `;
        table.innerHTML = header;

        const tbody = document.createElement('tbody');

        const currentPlanData = plansArray.find(plan => plan.plan === clientPlan);
        const currentPlanPrice = currentPlanData ? currentPlanData.price : null;

        console.log('Current plan data:', { currentPlanData, currentPlanPrice });

        plansArray.forEach((plan, index) => {
            const row = document.createElement('tr');
            const isCurrentPlan = plan.plan === clientPlan;
            
            if (isCurrentPlan) {
                row.classList.add('current-plan-row');
            }

            const savings = currentPlanPrice ? (currentPlanPrice - plan.price) : 0;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="${isCurrentPlan ? 'current-plan' : ''}">${plan.planHebrew}</td>
                
                <!-- Electricity Price Column with '₪' Symbol on the Left -->
                <td>₪ ${plan.price.toFixed(2)}</td>
                
                <!-- Savings Column with '₪' Symbol on the Left -->
                <td class="${savings > 0 ? 'positive-savings' : savings < 0 ? 'negative-savings' : ''}">
                    ${currentPlanPrice ? `₪ ${savings.toFixed(2)}` : 'לא זמין'}
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
