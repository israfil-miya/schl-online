import { useState } from "react";

const CallingStatusTd = ({ data }) => {
  const [showFullText, setShowFullText] = useState(false);

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <>
      <td className="text-wrap" style={{ minWidth: "400px" }}>
        {showFullText ? (
          <span>{data}</span>
        ) : (
          <span>
            {data.length <= 50 ? data : data.substring(0, 50).trim() + "..."}
          </span>
        )}
        {data.length > 50 && (
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

export default CallingStatusTd;
