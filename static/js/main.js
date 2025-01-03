document.addEventListener('DOMContentLoaded', function() {
    const resultsData = JSON.parse(document.getElementById('resultsData').textContent);
    
    try {
        // First update plan translations and savings
        const translations = JSON.parse(document.getElementById('plansTranslations').textContent);
        const plansData = JSON.parse(document.getElementById('plansData').textContent);
        const clientPlan = JSON.parse(document.getElementById('clientPlan').textContent);

        // Find current plan price
        const currentPlanData = Object.values(plansData).find(item => item.plan === clientPlan);
        const currentPlanPrice = currentPlanData ? currentPlanData['price(ILS)'] : null;

        // Update plan names and calculate savings
        document.querySelectorAll('.plan-name').forEach(element => {
            const planKey = element.getAttribute('data-plan');
            if (translations[planKey]) {
                element.textContent = translations[planKey];
            }
        });

        // Update savings for each card
        document.querySelectorAll('.plan-savings').forEach(element => {
            const price = parseFloat(element.getAttribute('data-price'));
            const savings = currentPlanPrice ? (currentPlanPrice - price) : 0;
            element.textContent = `חיסכון: ${savings.toFixed(2)} ₪`;
        });

        // Handle show/hide functionality
        const showMoreButton = document.getElementById('showMoreButton');
        const moreContent = document.getElementById('moreContent');
        
        if (showMoreButton && moreContent) {
            // Get saved state from localStorage
            const isContentVisible = localStorage.getItem('moreContentVisible') === 'true';
            
            // Set initial state based on localStorage
            moreContent.style.display = isContentVisible ? 'block' : 'none';
            showMoreButton.textContent = isContentVisible 
                ? 'הסתר מידע'
                : 'תראה לי עוד מידע וגרפים על הצריכת חשמל שלי';
            
            // Initialize charts if content is visible
            if (isContentVisible) {
                initializeCharts(resultsData);
            }

            showMoreButton.addEventListener('click', function() {
                const willBeVisible = moreContent.style.display !== 'block';
                moreContent.style.display = willBeVisible ? 'block' : 'none';
                showMoreButton.textContent = willBeVisible 
                    ? 'הסתר מידע'
                    : 'תראה לי עוד מידע וגרפים על הצריכת חשמל שלי';
                
                // Save state to localStorage
                localStorage.setItem('moreContentVisible', willBeVisible);
                
                // Initialize charts when showing content
                if (willBeVisible) {
                    initializeCharts(resultsData);
                }
            });
        }

    } catch (error) {
        console.error('Error initializing visualizations:', error);
    }
});

// Helper function to initialize all charts
function initializeCharts(resultsData) {
    if (typeof initDailySumTimeSeries === 'function') {
        initDailySumTimeSeries(resultsData);
    }
    if (typeof initHourlyBinChart === 'function') {
        initHourlyBinChart(resultsData.hourly_agg);
    }
    if (typeof initSavingsTimeSeries === 'function') {
        initSavingsTimeSeries(resultsData.diff_saving);
    }
    if (typeof initFinalPlansTable === 'function') {
        initFinalPlansTable(resultsData);
    }
}