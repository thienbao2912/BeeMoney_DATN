import React, { useState } from 'react';
import SavingsFundList from '../SavingsFundList/SavingsFundList';
import CreateSavingsFund from '../CreateSavingsFund/CreateSavingsFund';
import EditSavingsFund from '../EditSavingsFund/EditSavingsFund';


const SavingsFundDashboard = () => {
  const [selectedFundId, setSelectedFundId] = useState(null);

  return (
    <div>
      <h1>Savings Fund Dashboard</h1>
      <SavingsFundList />
      <CreateSavingsFund onFundCreated={() => window.location.reload()} />
      {selectedFundId && (
        <>
          <EditSavingsFund fundId={selectedFundId} onFundUpdated={() => window.location.reload()} />
         
        </>
      )}
    </div>
  );
};

export default SavingsFundDashboard;
