import React, { useState, useEffect } from 'react';
import { useNotification } from '@/components/context/NotificationContext';
import CopyButton from '@/components/common/CopyButton';

interface UrlParametersProps {
  originalUrl: string;
}

interface UrlParameter {
  key: string;
  value: string;
}

const UrlParameters = ({ originalUrl }: UrlParametersProps) => {
  const [parameters, setParameters] = useState<UrlParameter[]>([{ key: '', value: '' }]);
  const { showNotification } = useNotification();

  useEffect(() => {
    try {
      const url = new URL(originalUrl);
      const existingParams: UrlParameter[] = [];
      url.searchParams.forEach((value, key) => {
        existingParams.push({ key, value });
      });
      if (existingParams.length > 0) {
        setParameters(existingParams);
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    }
  }, [originalUrl]);

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
    const validParams = parameters.filter((p) => p.key && p.value);
    if (validParams.length === 0) return originalUrl;

    try {
      const url = new URL(originalUrl);
      // Clear existing parameters
      url.search = '';
      // Add new parameters
      validParams.forEach((param) => {
        url.searchParams.append(param.key, param.value);
      });
      return url.toString();
    } catch (error) {
      console.error('Error generating URL with parameters:', error);
      return originalUrl;
    }
  };

  return (
    <div className="mt-8 p-6 bg-primary-darkest/30 rounded-lg border border-primary-light/20">
      <h3 className="text-primary-lightest text-lg mb-4">Add Parameters to Original URL</h3>
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
        <h4 className="text-primary-lightest mb-2">Original URL with Parameters:</h4>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={generateUrlWithParams()}
            readOnly
            className="flex-1 px-3 py-2 rounded-lg bg-primary-darkest/50 border border-primary-light/30 text-white"
          />
          <CopyButton
            value={generateUrlWithParams()}
            onCopied={() => showNotification('URL with parameters copied to clipboard!', 'success')}
            className="bg-primary-light hover:bg-primary-lightest text-white px-4 py-2 rounded-lg transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default UrlParameters;
