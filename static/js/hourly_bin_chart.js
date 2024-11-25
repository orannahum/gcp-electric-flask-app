console.log('Chart script loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    function getColorForValue(value, minValue, maxValue) {
        // Calculate percentage between min and max
        const percentage = (value - minValue) / (maxValue - minValue);
        
        // Direct gradient from green to red
        const r = Math.round(255 * percentage);
        const g = Math.round(255 * (1 - percentage));
        const b = 0;
        
        return `rgba(${r}, ${g}, ${b}, 0.4)`; // Transparent
    }

    function createChart(hourlyData) {
        console.log('Creating chart with data:', hourlyData);

        // Get the canvas
        const canvas = document.getElementById('hourlyConsumptionChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        // Prepare the data
        const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`);
        const values = Array(24).fill(0);

        // Fill in the values
        Object.entries(hourlyData).forEach(([hour, data]) => {
            const hourIndex = parseInt(hour);
            if (hourIndex >= 0 && hourIndex < 24) {
                values[hourIndex] = data['Consumption (kWh)'];
            }
        });

        // Find min and max values (excluding zeros)
        const nonZeroValues = values.filter(v => v > 0);
        const minValue = Math.min(...nonZeroValues);
        const maxValue = Math.max(...values);

        // Create background colors array
        const backgroundColors = values.map(value => 
            value === 0 ? 'rgba(200, 200, 200, 0.2)' : getColorForValue(value, minValue, maxValue)
        );

        // Create border colors array (slightly darker)
        const borderColors = values.map(value => 
            value === 0 ? 'rgba(200, 200, 200, 0.3)' : 
            getColorForValue(value, minValue, maxValue).replace('0.4', '0.6')
        );

        // Create the chart
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Energy Consumption (kWh)',
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
                        display: true,
                        text: 'Hourly Energy Consumption'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Consumption (kWh)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    }
                }
            }
        });

        // Add legend
        const legendHtml = `
            <div style="margin-top: 10px; text-align: center; font-size: 12px; color: #666;">
                <div style="display: inline-block; margin: 0 10px;">
                    <span style="display: inline-block; width: 20px; height: 20px; background: rgba(0, 255, 0, 0.4); vertical-align: middle; border: 1px solid rgba(0, 255, 0, 0.6);"></span>
                    <span style="margin-left: 5px;">Low Consumption</span>
                </div>
                <div style="display: inline-block; margin: 0 10px;">
                    <span style="display: inline-block; width: 20px; height: 20px; background: rgba(255, 0, 0, 0.4); vertical-align: middle; border: 1px solid rgba(255, 0, 0, 0.6);"></span>
                    <span style="margin-left: 5px;">High Consumption</span>
                </div>
            </div>
        `;
        
        // Insert the legend after the chart container
        const chartContainer = canvas.parentElement;
        chartContainer.insertAdjacentHTML('afterend', legendHtml);
    }

    // Get the pre element with the results
    const preElement = document.querySelector('pre');
    if (!preElement) {
        console.error('No pre element found with results data');
        return;
    }

    try {
        // Parse the JSON data
        const results = JSON.parse(preElement.textContent);
        console.log('Parsed results:', results);

        // Check for hourly_agg data
        if (!results.hourly_agg) {
            console.error('No hourly_agg data found in results');
            return;
        }

        // Create the chart
        createChart(results.hourly_agg);

    } catch (error) {
        console.error('Error processing data:', error);
    }
});