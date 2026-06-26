import React from "react";
import "./MySkeletion.css";

const MySkeletion = ({
  variant = "text",
  width,
  height,
  className = "",
  count = 1,
  style = {},
}) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => {
        const classNames = `skeleton skeleton-${variant} ${className}`;
        const styles = {
          width: width,
          height: height,
          ...style,
        };

        return (
          <div
            key={index}
            className={classNames}
            style={styles}
            data-testid="skeleton-loader"
          ></div>
        );
      })}
    </>
  );
};

export default MySkeletion;
