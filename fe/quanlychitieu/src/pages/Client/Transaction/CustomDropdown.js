import React, { useState } from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (selectedValue) => {
        onChange({ target: { value: selectedValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(option => option._id === value);

    return (
        <div className="custom-dropdown">
            <div className="dropdown-header" onClick={handleToggle}>
                {selectedOption ? (
                    <>
                        {selectedOption.image && (
                            <img
                                src={selectedOption.image}
                                alt={selectedOption.name}
                                width="20"
                                height="20"
                                className="me-2"
                            />
                        )}
                        {selectedOption.name}
                    </>
                ) : (
                    'Chọn danh mục'
                )}
                <span className="arrow">&#9662;</span>
            </div>
            {isOpen && (
                <div className="dropdown-list">
                    {options.map(option => (
                        <div
                            key={option._id}
                            className="dropdown-item"
                            onClick={() => handleSelect(option._id)}
                        >
                            {option.image && (
                                <img
                                    src={option.image}
                                    alt={option.name}
                                    width="20"
                                    height="20"
                                    className="me-2"
                                />
                            )}
                            {option.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
