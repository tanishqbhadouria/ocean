import React, { useMemo, useCallback } from 'react';
import Select from 'react-select/async';
import debounce from 'lodash/debounce';

const PortSearch = ({ ports, onSelect, placeholder }) => {
    // Transform ports data once and memoize it
    const portOptions = useMemo(() => 
        ports.features?.map(port => ({
            value: port.geometry.coordinates,
            label: port.properties.PORT_NAME,
            searchStr: `${port.properties.PORT_NAME} ${port.properties.COUNTRY || ''} ${port.geometry.coordinates.join(' ')}`.toLowerCase()
        })) || [], 
        [ports]
    );

    // Debounced search function
    const loadOptions = useCallback(
        debounce((inputValue, callback) => {
            const filtered = portOptions.filter(option => 
                option.searchStr.includes(inputValue.toLowerCase())
            ).slice(0, 100); // Limit results to prevent lag
            
            callback(filtered);
        }, 300),
        [portOptions]
    );

    const customStyles = {
        control: (base) => ({
            ...base,
            minHeight: '42px',
            borderRadius: '0.375rem'
        }),
        option: (base) => ({
            ...base,
            padding: '8px 12px',
            cursor: 'pointer'
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '200px'
        })
    };

    const formatOptionLabel = useCallback(({ label, value }) => (
        <div>
            <div className="font-medium">{label}</div>
            <div className="text-sm text-gray-500">
                {value[0].toFixed(4)}, {value[1].toFixed(4)}
            </div>
        </div>
    ), []);

    return (
        <Select
            async
            loadOptions={loadOptions}
            onChange={(option) => onSelect(option?.value)}
            placeholder={placeholder}
            styles={customStyles}
            formatOptionLabel={formatOptionLabel}
            className="w-full"
            isClearable
            cacheOptions
            defaultOptions
            filterOption={null} // Disable client-side filtering
        />
    );
};

export default React.memo(PortSearch);
