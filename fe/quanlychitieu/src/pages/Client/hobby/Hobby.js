import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./hobby.css";

const Hobby = () => {
  const [selectedCurrency, setSelectedCurrency] = useState({
    name: "Việt Nam Đồng",
    flag: "🇻🇳",
  });
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const currencyList = [
    { id: "VND", name: "Việt Nam Đồng", flag: "🇻🇳" },
    { id: "USD", name: "Đô la Mỹ", flag: "🇺🇸" },
    { id: "EUR", name: "Euro", flag: "🇪🇺" },
  ];

  const toggleDropdown = () => setDropdownVisible(!isDropdownVisible);

  const selectCurrency = (currency) => {
    setSelectedCurrency({ name: currency.name, flag: currency.flag });
    setDropdownVisible(false);
  };

  return (
    <div align="center" className="container1">
      <div>
        <h4 className="headmoney">chọn đơn vị tiền tệ bạn sử dụng</h4>
        <span>Bạn có thể thay đổi sang đơn vị tiền khác bất cứ lúc nào.</span>
      </div>
      <div className="currency-container1">
        <div className="currency-input1">
          <span className="currency-flag1">{selectedCurrency.flag}</span>
          <span className="currency-name1">{selectedCurrency.name}</span>
          <button className="edit-button1" onClick={toggleDropdown}>
            Sửa
          </button>
        </div>

        {isDropdownVisible && (
          <div className="dropdown-list1">
            {currencyList.map((currency) => (
              <div
                key={currency.id}
                className="dropdown-item1"
                onClick={() => selectCurrency(currency)}
              >
                <span className="currency-flag1">{currency.flag}</span>
                <span>{currency.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <button className="button-sc">Tiếp tục</button>
      </div>
    </div>
  );
};

export default Hobby;
