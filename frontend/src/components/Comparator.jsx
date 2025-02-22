import React, { useState } from 'react';
import { AI_API_END_POINT } from '@/utils/constant';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const Comparator = () => {
  const [company1, setCompany1] = useState({ name: '', package: '' });
  const [company2, setCompany2] = useState({ name: '', package: '' });
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractJSON = rawData => {
    try {
      // Extract content between ```json ... ```
      const match = rawData.match(/```json\n([\s\S]*?)\n```/);
      return match ? JSON.parse(match[1]) : JSON.parse(rawData);
    } catch (error) {
      console.error('Error extracting JSON:', error);
      return null;
    }
  };

  const handleCompare = async () => {
    if (
      !company1.name ||
      !company2.name ||
      !company1.package ||
      !company2.package
    ) {
      alert('Please fill in both company names and salaries.');
      return;
    }

    const prompt = `Company1:${company1.name} salary:${company1.package}lpa Company2:${company2.name} salary:${company2.package}lpa`;

    try {
      const response = await fetch(`${AI_API_END_POINT}/comparator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }

      let responseData = await response.json(); // Get JSON response
      console.log('Raw API Response:', responseData);

      let parsedData = extractJSON(responseData.result); // Extract clean JSON
      console.log('Parsed API Response:', parsedData);

      if (parsedData) {
        setComparisonData(parsedData);
      } else {
        alert('Failed to parse comparison data.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching comparison data. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-white text-purple-700">
      <h1 className="text-3xl font-bold mb-6">Job Offer Comparator</h1>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {['company1', 'company2'].map((key, index) => (
          <div key={index} className="bg-purple-100 p-6 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder={`Company ${index + 1} Name`}
              className="w-full p-2 mb-3 border border-purple-300 rounded-md"
              onChange={e =>
                key === 'company1'
                  ? setCompany1({ ...company1, name: e.target.value })
                  : setCompany2({ ...company2, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Package (LPA)"
              className="w-full p-2 border border-purple-300 rounded-md"
              onChange={e =>
                key === 'company1'
                  ? setCompany1({ ...company1, package: e.target.value })
                  : setCompany2({ ...company2, package: e.target.value })
              }
            />
          </div>
        ))}
      </div>
      <button
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-800"
        onClick={handleCompare}
      >
        {loading ? 'Comparing...' : 'Compare'}
      </button>

      {comparisonData && (
        <div className="mt-8 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4">Comparison Results</h2>

          {/* Salary Growth */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold">Salary Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData.salaryGrowth}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={company1.name} fill="#6a0dad" />
                <Bar dataKey={company2.name} fill="#9370db" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Job Security */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-lg mt-6">
            <h3 className="text-xl font-bold">Job Security</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={comparisonData.jobSecurity}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar
                  name={company1.name}
                  dataKey={company1.name}
                  stroke="#6a0dad"
                  fill="#6a0dad"
                  fillOpacity={0.6}
                />
                <Radar
                  name={company2.name}
                  dataKey={company2.name}
                  stroke="#9370db"
                  fill="#9370db"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="bg-white p-4 mt-6 rounded-lg shadow">
            <h3 className="text-xl font-bold">Summary</h3>
            <p className="text-gray-700">{comparisonData.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparator;
