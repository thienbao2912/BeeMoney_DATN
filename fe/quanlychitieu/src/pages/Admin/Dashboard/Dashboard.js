import React from 'react';
import Layout from '../../../layouts/AdminLayout';
import DashboardStatistics from '../Content/Content';
const Dashboard = () => {
  return (
    <Layout>
      <div className="container-fluid py-4">
        <DashboardStatistics />
      </div>
    </Layout>
  );
};

export default Dashboard;
