import React from "react";

interface PercentageChangeProps {
  current: number;
  lastMonth: number;
  timePeriod: string;
}

const PercentageChange: React.FC<PercentageChangeProps> = ({
  current,
  lastMonth,
  timePeriod,
}) => {
  if (lastMonth === 0) {
    return <span className="text-gray-500">N/A</span>;
  }

  const change = ((current - lastMonth) / Math.abs(lastMonth)) * 100;
  const isPositive = change >= 0;
  const formattedChange = Math.abs(change).toFixed(2);

  return (
    <span className={isPositive ? "text-green-600" : "text-red-600"}>
      {isPositive ? "+" : "-"}
      {formattedChange}% from last {timePeriod}
    </span>
  );
};

export default PercentageChange;
