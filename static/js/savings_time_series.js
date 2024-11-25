console.log('Savings chart script loading...');

document.addEventListener('DOMContentLoaded', function() {
    function createSavingsChart(diffSavingData) {
        // Get the canvas
        const canvas = document.getElementById('savingsTimeSeriesChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        // Define colors for different plans
        const colors = {
            plan_cellcom1_diff: { line: 'rgba(75, 192, 192, 0.8)', fill: 'rgba(75, 192, 192, 0.2)' },
            plan_cellcom2_diff: { line: 'rgba(255, 99, 132, 0.8)', fill: 'rgba(255, 99, 132, 0.2)' },
            plan_cellcom3_diff: { line: 'rgba(54, 162, 235, 0.8)', fill: 'rgba(54, 162, 235, 0.2)' },
            plan_cellcom4_diff: { line: 'rgba(153, 102, 255, 0.8)', fill: 'rgba(153, 102, 255, 0.2)' }
        };

        // Process the data
        const datasets = Object.entries(diffSavingData).map(([plan, data]) => {
            const planColors = colors[plan] || { 
                line: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`,
                fill: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`
            };

            return {
                label: plan.replace('plan_', '').replace('_diff', ''),
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

        // Create the chart
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
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Savings Comparison Over Time',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
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
                                return date.toLocaleDateString('en-GB', {
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
                            text: 'Date'
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
                            text: 'Savings (₪)'
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

    // Get the pre element with the results
    const preElement = document.querySelector('pre');
    if (!preElement) {
        console.error('No pre element found with results data');
        return;
    }

    try {
        // Parse the JSON data
        const results = JSON.parse(preElement.textContent);
        
        // Check for diff_saving data
        if (!results.diff_saving) {
            console.error('No diff_saving data found in results');
            return;
        }

        // Create the chart
        createSavingsChart(results.diff_saving);

    } catch (error) {
        console.error('Error processing data:', error);
    }
});