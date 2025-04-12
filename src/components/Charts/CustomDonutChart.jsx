import React from "react";

const degToRad = (angle) => (angle * Math.PI) / 180;

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = {
    x: x + radius * Math.cos(degToRad(startAngle)),
    y: y + radius * Math.sin(degToRad(startAngle)),
  };

  const end = {
    x: x + radius * Math.cos(degToRad(endAngle)),
    y: y + radius * Math.sin(degToRad(endAngle)),
  };

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

const CustomDonutChart = ({
  data,
  colors,
  radius = 45,
  strokeWidth = 10,
  size = 100,
}) => {
  const total = data?.reduce((sum, item) => sum + item.value, 0);
  let cumulativeAngle = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
      {data?.map((item, index) => {
        const value = item.value;
        const percentage = value / total;
        const angle = percentage * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle += angle;

        const arc = describeArc(
          size / 2,
          size / 2,
          radius,
          startAngle - 90,
          endAngle - 90
        );

        return (
          <path
            key={index}
            d={arc}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(percentage * 2 * Math.PI * radius).toFixed(
              6
            )}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            stroke={colors[index]}
            style={{ transition: "stroke-dashoffset 500ms ease-out" }}
          >
            <title>{item.label}</title>
          </path>
        );
      })}
    </svg>
  );
};

export default CustomDonutChart;
