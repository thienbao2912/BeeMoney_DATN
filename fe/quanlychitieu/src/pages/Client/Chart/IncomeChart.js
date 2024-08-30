import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const IncomeChart = ({ data, onClick }) => { // Nhận thêm prop onClick
    console.log("IncomeChart Data:", data);

    const chartData = {
        labels: data.map(item => item.name || 'Unknown'),
        datasets: [
            {
                label: 'Thu nhập theo danh mục',
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
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        onClick: (event, elements) => { // Thêm sự kiện onClick
            if (elements.length > 0) {
                const elementIndex = elements[0].index;
                onClick(data[elementIndex]); // Gọi onClick với dữ liệu phần tử được nhấn
            }
        }
    };

    return <Pie data={chartData} options={options} />;
};

export default IncomeChart;