import React from "react";

const style = {
  height: 30,
  border: "1px solid pink",
  margin: 6,
  padding: 8
};

function Large() {
  const items = [];
  for (let i = 0; i < 60; i++) {
    items.push(<div key={i} style={style}>{`Item ${i + 1}`}</div>);
  }

  return <React.Fragment>{items}</React.Fragment>;
}

export default Large;
