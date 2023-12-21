import React, { useState } from "react";

const replaceNewlineWithBr = (text) => {
  const lines = text.split("\n");
  const truncatedText = lines.slice(0, 1).join(""); // Display only the first line
  const remainingLines = lines.slice(1);

  return (
    truncatedText +
    (remainingLines.length > 0 ? "<br/>" : "") +
    remainingLines.join("<br/>")
  );
};

const ExtandableTd = ({ data }) => {
  const [showFullText, setShowFullText] = useState(false);

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <>
      <td className="text-wrap" style={{ minWidth: "200px" }}>
        {showFullText ? (
          <span
            dangerouslySetInnerHTML={{ __html: replaceNewlineWithBr(data) }}
          />
        ) : (
          <span className="text-nowrap">
            {data.length <= 22 ? data : data.substring(0, 22).trim() + "..."}
          </span>
        )}
        {data.length > 22 && (
          <small className="link" onClick={toggleText}>
            <br />
            {showFullText ? "Show Less" : "Show More"}
          </small>
        )}
      </td>

      <style jsx>
        {`
          .link:hover {
            cursor: pointer;
            text-decoration: underline;
            color: rgba(0, 0, 0, 0.7);
          }
        `}
      </style>
    </>
  );
};

export default ExtandableTd;
