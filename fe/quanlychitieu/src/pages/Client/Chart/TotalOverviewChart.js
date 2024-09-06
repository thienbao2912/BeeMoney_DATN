import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

const TotalOverviewChart = ({ totalIncome, totalExpenses }) => {
    const remainingAmount = totalIncome - totalExpenses;

    const data = [
        { id: 'Tổng Chi tiêu', value: totalExpenses },
        { id: 'Tổng Thu nhập', value: totalIncome },
    ];

    if (remainingAmount >= 0) {
        data.push({ id: 'Còn lại', value: remainingAmount });
    }

    const formatCurrency = (value) => {
        if (value >= 1e9) {
            return `${(value / 1e9).toFixed(1)} T`; 
        } else if (value >= 1e6) {
            return `${(value / 1e6).toFixed(1)} M`; 
        } else {
            return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        }
    };

    const colors = [
        'rgba(255, 99, 132, 0.8)',  // Red
        'rgba(54, 162, 235, 0.8)',  // Blue
        'rgba(255, 159, 64, 0.8)',  // Orange
        'rgba(255, 206, 86, 0.8)',  // Yellow
        'rgba(75, 192, 192, 0.8)',  // Teal
        'rgba(153, 102, 255, 0.8)', // Purple
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ height: '25rem' }}>
                <ResponsiveBar
                    data={data}
                    keys={['value']}
                    indexBy="id"
                    margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
                    padding={0.3}
                    colors={({ index }) => colors[index % colors.length]}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45, // Rotate labels
                        legend: '',
                        legendPosition: 'middle',
                        legendOffset: 40,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',  // Removed "Value" label
                        legendPosition: 'middle',
                        legendOffset: -40,
                        format: formatCurrency,
                    }}
                    tooltip={({ id, value }) => (
                        <div
                            style={{
                                padding: '8px 15px',
                                color: '#333',
                                background: colors[data.findIndex(item => item.id === id) % colors.length],
                                borderRadius: '8px',
                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '14px',
                            }}
                        >
                            <span>{formatCurrency(value)}</span>
                        </div>
                    )}
                    label={({ value }) => formatCurrency(value)}
                    labelSkipWidth={0} // Make sure to skip width for labels
                    labelSkipHeight={0} // Make sure to skip height for labels
                    labelTextColor="#fff" // Set the label color
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: '#555',
                                    fontSize: 12,
                                },
                            },
                        },
                    }}
                />
            </div>
            {remainingAmount < 0 && (
                <div style={{ 
                    marginTop: '20px', 
                    textAlign: 'center', 
                    color: 'red',
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '4px',
                    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                }}>
                    <strong>Số tiền còn lại âm: {formatCurrency(remainingAmount)}</strong>
                </div>
            )}
        </div>
    );
};

export default TotalOverviewChart;
