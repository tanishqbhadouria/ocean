import React from 'react';
import Select from 'react-select';

const PortSearch = ({ ports, onSelect, placeholder }) => {
    // Transform ports data for react-select
    const options = ports.features?.map(port => ({
        value: port.geometry.coordinates,
        label: port.properties.PORT_NAME,
        data: port
    })) || [];

    const customStyles = {
        control: (base) => ({
            ...base,
            minHeight: '42px',
            borderRadius: '0.375rem'
        }),
        option: (base, state) => ({
            ...base,
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: state.isFocused ? '#f3f4f6' : 'white'
        })
    };

    const formatOptionLabel = ({ label, value }) => (
        <div>
            <div className="font-medium">{label}</div>
            <div className="text-sm text-gray-500">
                {value[0].toFixed(4)}, {value[1].toFixed(4)}
            </div>
        </div>
    );

    return (
        <Select
            options={options}
            onChange={(option) => onSelect(option.value)}
            placeholder={placeholder}
            styles={customStyles}
            formatOptionLabel={formatOptionLabel}
            className="w-full"
            isClearable
            isSearchable
            maxMenuHeight={200}
        />
    );
};

export default PortSearch;
