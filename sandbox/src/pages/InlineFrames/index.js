import React from "react";

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100vh',
  position: 'absolute',
  alignContent: 'space-around',
  width: '100vw'
};

const frameStyle = {
  flexGrow: 1,
  margin: 20,
  width: 'calc(100% - 40px)'
};

const buttonStyle = {
  flexGrow: 0,
  height: 30,
  margin: 20,
  width: 'calc(100% - 40px)'
};

function InlineFrames() {
  return (
    <div style={style}>
      <button type="button" style={buttonStyle}>Main Page Button</button>
      <iframe src="/buttons" style={frameStyle} title="Buttons" data-qa="first" />
      <iframe src="/text-inputs" style={frameStyle} title="Text inputs" data-qa="second" />
    </div>
  );
}

export default InlineFrames;
