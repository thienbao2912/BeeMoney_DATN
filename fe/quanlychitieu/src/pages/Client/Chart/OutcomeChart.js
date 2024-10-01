import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const formatCurrency = (value) => {
    if (value >= 1e9) {
        return `${(value / 1e9).toFixed(1)} T`; 
    } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(1)} tr`;  
    } else if (value >= 1e5) {
        return `${(value / 1e3).toFixed(0)}k`;   
    } else {
        return value.toLocaleString('vi-VN');   
    }
};

const OutcomeChart = ({ data, onClick }) => {
    console.log("OutcomeChart Data:", data);

    const chartData = {
        labels: data.map(item => item.name || 'Unknown'),
        datasets: [
            {
                label: 'Chi tiêu theo danh mục',
                data: data.map(item => item.y || 0),
                backgroundColor: [
                    '#A6CEE3',  
                    '#FDB5B5',  
                    '#FFE2A1',  
                    '#B2DFDB', 
                    '#C5E1A5'   
                ],
                hoverBackgroundColor: [
                    '#A6CEE3',  
                    '#FDB5B5',  
                    '#FFE2A1',  
                    '#B2DFDB', 
                    '#C5E1A5'
                ]
            }
        ]
    };

    const options = {
        plugins: {
            datalabels: {
                color: '#fff',
                formatter: (value, context) => {
                    const total = context.chart._metasets[0].total;
                    const percentage = ((value / total) * 100).toFixed(2) + '%';
                    return percentage;
                },
                anchor: 'end',
                align: 'start',
                offset: 10
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const label = tooltipItem.label || '';
                        const value = tooltipItem.raw || 0;
                        return `${label}: ${formatCurrency(value)}`;  
                    }
                }
            }
        },
        onClick: (event, elements) => { 
            if (elements.length > 0) {
                const elementIndex = elements[0].index;
                if (onClick) {
                    onClick(data[elementIndex]);
                }
            }
        }
    };

    return <Pie data={chartData} options={options} />;
};

export default OutcomeChart;
