import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
const MyCircularProgress = ({
  value,
  text,
  pathColor,
  trailColor,
  textColor,
  textSize,
}) => {
  return (
    <CircularProgressbar
      value={value}
      text={text}
      styles={buildStyles({
        pathColor: pathColor || "#3ecf8e",
        strokeLinecap: "round",
        trailColor: trailColor || "#eee",
        textColor: textColor || "#000",
        textSize: textSize || "18px",
      })}
    />
  );
};

export default MyCircularProgress;
