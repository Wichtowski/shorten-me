import React, { useState } from "react";
import { useNotification } from "@components/context/NotificationContext";
import { CopyButton } from "@components/common/CopyButton";

interface UrlParametersProps {
  originalUrl: string;
}

interface UrlParameter {
  key: string;
  value: string;
}

const parseParameters = (originalUrl: string): UrlParameter[] => {
  try {
    const url = new URL(originalUrl);
    const existingParams: UrlParameter[] = [];

    url.searchParams.forEach((value, key) => {
      existingParams.push({ key, value });
    });

    return existingParams.length > 0 ? existingParams : [{ key: "", value: "" }];
  } catch (error) {
    console.error("Error parsing URL parameters:", error);
    return [{ key: "", value: "" }];
  }
};

export const UrlParameters = ({ originalUrl }: UrlParametersProps) => {
  const [parameters, setParameters] = useState<UrlParameter[]>(() => parseParameters(originalUrl));
  const { showNotification } = useNotification();

  const addParameter = () => {
    setParameters([...parameters, { key: "", value: "" }]);
  };

  const updateParameter = (index: number, field: "key" | "value", value: string) => {
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
      url.search = "";
      // Add new parameters
      validParams.forEach((param) => {
        url.searchParams.append(param.key, param.value);
      });
      return url.toString();
    } catch (error) {
      console.error("Error generating URL with parameters:", error);
      return originalUrl;
    }
  };

  return (
    <div className="surface rounded-xl p-6 sm:p-8">
      <div className="mb-5 space-y-2">
        <p className="eyebrow">Optional</p>
        <h3 className="text-xl font-semibold text-slate-100">Add parameters to the original URL</h3>
        <p className="text-sm leading-6 text-[#bac9cc]">
          Build a parameterized version of the source link before sharing it elsewhere
        </p>
      </div>
      <div className="space-y-3">
        {parameters.map((param, index) => (
          <div key={index} className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              type="text"
              value={param.key}
              onChange={(e) => updateParameter(index, "key", e.target.value)}
              placeholder="Parameter name"
              className="field flex-1 px-3 py-2"
            />
            <input
              type="text"
              value={param.value}
              onChange={(e) => updateParameter(index, "value", e.target.value)}
              placeholder="Value"
              className="field flex-1 px-3 py-2"
            />
            <button
              onClick={() => removeParameter(index)}
              className="subtle-button px-3 py-2 text-sm text-rose-200 hover:text-rose-100"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addParameter}
          className="subtle-button"
        >
          Add parameter
        </button>
      </div>

      <div className="mt-6">
        <h4 className="mono-label mb-3">
          Original URL with parameters
        </h4>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="text" value={generateUrlWithParams()} readOnly className="field flex-1" />
          <CopyButton
            value={generateUrlWithParams()}
            onCopied={() => showNotification("URL with parameters copied to clipboard!", "success")}
            className="primary-button px-5 py-3"
          />
        </div>
      </div>
    </div>
  );
};
