document.addEventListener('DOMContentLoaded', function() {
    console.log('Script started');
    try {
        // Get translations from the hidden element
        const translationsElement = document.getElementById('plansTranslations');
        const plans_translate_to_hebrew = JSON.parse(translationsElement.textContent);
        
        // Get the data elements with the correct IDs from the HTML
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

        // Parse the JSON data
        const plansData = JSON.parse(plansDataElement.textContent);
        const clientPlan = JSON.parse(clientPlanElement.textContent);

        console.log('Parsed data:', { plansData, clientPlan });

        // Convert object to array and filter out "Consumption (kWh)"
        const plansArray = Object.values(plansData)
            .filter(item => item && item.plan && item.plan !== "Consumption (kWh)")
            .map(item => ({
                plan: item.plan,
                planHebrew: plans_translate_to_hebrew[item.plan] || item.plan, // Use Hebrew name if available
                price: item['price(ILS)']
            }))
            .sort((a, b) => a.price - b.price);

        console.log('Processed plans array:', plansArray);

        // Create table
        const table = document.createElement('table');
        table.className = 'plans-table';
        table.dir = 'rtl'; // Set direction to right-to-left for Hebrew

        // Add header
        const header = `
            <thead>
                <tr>
                    <th>דירוג</th>
                    <th>שם תוכנית</th>
                    <th>מחיר (₪)</th>
                    <th>חיסכון לעומת התוכנית הנוכחית (₪)</th>
                </tr>
            </thead>
        `;
        table.innerHTML = header;

        // Create table body
        const tbody = document.createElement('tbody');

        // Find current plan price
        const currentPlanData = plansArray.find(plan => plan.plan === clientPlan);
        const currentPlanPrice = currentPlanData ? currentPlanData.price : null;

        console.log('Current plan data:', { currentPlanData, currentPlanPrice });

        // Create rows
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
                <td>${plan.price.toFixed(2)}</td>
                <td class="${savings > 0 ? 'positive-savings' : savings < 0 ? 'negative-savings' : ''}">${
                    currentPlanPrice ? savings.toFixed(2) : 'לא זמין'
                }</td>
            `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableContainer.innerHTML = ''; // Clear any existing content
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