import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const VerticalBarChart = ({ totalBudget, totalExpenses, startDate, endDate, categoryName }) => {
    const data = {
        labels: ['Ngân sách tổng', 'Đã chi'],
        datasets: [
            {
                label: 'Số tiền (VND)',
                data: [totalBudget, totalExpenses],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
                barThickness: 60,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20, 
                },
            },
            title: {
                display: true,
                text: `Biểu đồ Ngân sách ${categoryName} (${startDate} - ${endDate})`,
                padding: {
                    top: 0, 
                    bottom: 0, 
                },
            },
            datalabels: {
                display: true,
                color: 'black',
                align: 'end', 
                anchor: 'end',
                formatter: (value) => {
                    return (typeof value === 'number' ? value.toLocaleString() : '');
                },
                padding: {
                    top: 10,
                    bottom: 0,
                },
            },
            label: {
                padding: {
                    top: 10,
                    bottom: 10,
                },
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 50000,
                },
                title: {
                    display: true,
                    text: 'Số tiền (VND)',
                    padding: {
                        bottom: 10, 
                    },
                },
            },
            x: {
                barPercentage: 0.7, 
                categoryPercentage: 0.8,
                title: {
                    display: true,
                    text: 'Danh mục',
                    padding: {
                        top: 10, 
                    },
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default VerticalBarChart;