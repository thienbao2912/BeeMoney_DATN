import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Đăng ký các thành phần và plugin cần thiết cho Chart.js
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
                barThickness: 60, // Đặt kích thước cụ thể cho các cột (tính bằng pixel)
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20, // Khoảng cách giữa legend và biểu đồ
                },
            },
            title: {
                display: true,
                text: `Biểu đồ Ngân sách ${categoryName} (${startDate} - ${endDate})`,
                padding: {
                    top: 0, // Khoảng cách giữa tiêu đề và biểu đồ
                    bottom: 0, // Khoảng cách dưới tiêu đề nếu cần
                },
            },
            datalabels: {
                display: true,
                color: 'black',
                align: 'end', // Đặt nhãn lên đầu cột
                anchor: 'end',
                formatter: (value) => {
                    return (typeof value === 'number' ? value.toLocaleString() : ''); // Đảm bảo giá trị là số trước khi định dạng
                },
            },
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
                        bottom: 10, // Khoảng cách giữa tiêu đề trục y và trục y
                    },
                },
            },
            x: {
                barPercentage: 0.7, // Điều chỉnh giá trị này nếu cần
                categoryPercentage: 0.8, // Điều chỉnh khoảng cách giữa các nhóm cột nếu cần
                title: {
                    display: true,
                    text: 'Danh mục',
                    padding: {
                        top: 10, // Khoảng cách giữa tiêu đề trục x và trục x
                    },
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default VerticalBarChart;