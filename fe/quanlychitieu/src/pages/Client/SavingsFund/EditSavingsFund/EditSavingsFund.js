import React, { useState, useEffect } from 'react';
import { getSavingsFundById, updateSavingsFund } from '../../../../service/SavingFund';

const EditSavingsFund = ({ fundId, onFundUpdated }) => {
  const [fund, setFund] = useState(null);

  useEffect(() => {
    const fetchFund = async () => {
      try {
        const data = await getSavingsFundById(fundId);
        setFund(data);
      } catch (error) {
        console.error("Error fetching fund:", error);
      }
    };
    fetchFund();
  }, [fundId]);

  const handleUpdate = async () => {
    try {
      await updateSavingsFund(fundId, fund);
      onFundUpdated();
    } catch (error) {
      console.error("Error updating fund:", error);
    }
  };

  if (!fund) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Fund</h2>
      <input type="text" value={fund.name} onChange={(e) => setFund({ ...fund, name: e.target.value })} />
      <input type="number" value={fund.targetAmount} onChange={(e) => setFund({ ...fund, targetAmount: e.target.value })} />
      {/* Add other fields and input elements */}
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default EditSavingsFund;
