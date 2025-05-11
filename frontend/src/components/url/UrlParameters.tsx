import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';

interface UrlParametersProps {
    shortUrl: string;
}

interface UrlParameter {
    key: string;
    value: string;
}

const UrlParameters = ({ shortUrl }: UrlParametersProps) => {
    const [parameters, setParameters] = useState<UrlParameter[]>([{ key: '', value: '' }]);
    const { showNotification } = useNotification();

    const addParameter = () => {
        setParameters([...parameters, { key: '', value: '' }]);
    };

    const updateParameter = (index: number, field: 'key' | 'value', value: string) => {
        const newParameters = [...parameters];
        newParameters[index][field] = value;
        setParameters(newParameters);
    };

    const removeParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const generateUrlWithParams = () => {
        const validParams = parameters.filter(p => p.key && p.value);
        if (validParams.length === 0) return shortUrl;

        const searchParams = new URLSearchParams();
        validParams.forEach(param => {
            searchParams.append(param.key, param.value);
        });

        return `${shortUrl}?${searchParams.toString()}`;
    };

    const copyUrlWithParams = () => {
        const urlWithParams = generateUrlWithParams();
        navigator.clipboard.writeText(urlWithParams);
        showNotification('URL with parameters copied to clipboard!', 'success');
    };

    return (
        <div className="mt-8 p-6 bg-primary-darkest/30 rounded-lg border border-primary-light/20">
            <h3 className="text-primary-lightest text-lg mb-4">Add Parameters</h3>
            <div className="space-y-3">
                {parameters.map((param, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={param.key}
                            onChange={(e) => updateParameter(index, 'key', e.target.value)}
                            placeholder="Parameter name"
                            className="flex-1 px-3 py-2 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white focus:outline-none focus:border-primary-lightest focus:ring-2 focus:ring-primary-lightest/20"
                        />
                        <input
                            type="text"
                            value={param.value}
                            onChange={(e) => updateParameter(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="flex-1 px-3 py-2 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white focus:outline-none focus:border-primary-lightest focus:ring-2 focus:ring-primary-lightest/20"
                        />
                        <button
                            onClick={() => removeParameter(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={addParameter}
                    className="text-primary-lightest hover:text-white transition-colors"
                >
                    + Add Parameter
                </button>
            </div>

            <div className="mt-4">
                <h4 className="text-primary-lightest mb-2">URL with Parameters:</h4>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={generateUrlWithParams()}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white"
                    />
                    <button
                        onClick={copyUrlWithParams}
                        className="bg-primary-light hover:bg-primary-lightest text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        Copy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UrlParameters; 