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
        'rgba(255, 99, 132, 0.8)',  
        'rgba(54, 162, 235, 0.8)', 
        'rgba(255, 159, 64, 0.8)',  
        'rgba(255, 206, 86, 0.8)', 
        'rgba(75, 192, 192, 0.8)',  
        'rgba(153, 102, 255, 0.8)', 
    ];

    if (totalIncome === 0 && totalExpenses === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <strong>Hôm nay chưa có chi tiêu hay thu nhập nào</strong>
            </div>
        );
    }

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
                        tickRotation: -45,
                        legend: '',
                        legendPosition: 'middle',
                        legendOffset: 40,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',  
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
                    labelSkipWidth={0}
                    labelSkipHeight={0}
                    labelTextColor="#fff"
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
