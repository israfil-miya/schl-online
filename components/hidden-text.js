import React, { useState } from "react";
import { UilEye } from "@iconscout/react-unicons";

const HiddenText = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };

  return (
    <>
      <span
        className="link"
        role="button"
        tabindex="0"
        onClick={toggleVisibility}
      >
        {isVisible ? (
          children
        ) : (
          <span>
            <UilEye />
          </span>
        )}
      </span>

      <style jsx>
        {`
          .link:hover {
            cursor: pointer;
            text-decoration: underline;
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            -o-user-select: none;
            user-select: none;
          }
        `}
      </style>
    </>
  );
};

export default HiddenText;
