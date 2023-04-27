import React from "react";

const ProgressBar = (props) => {
  const { bgcolor, completed } = props;

  const containerStyles = {
    height: 10,
    width: '300%',
    backgroundColor: "#e0e0de",
    borderRadius: 50,
    position: 'relative',
    marginBottom: 10,
  }

  const fillerStyles = {
    height: '100%',
    width: `${completed}%`,
    backgroundColor: bgcolor,
    borderRadius: 'inherit',
    textAlign: 'right',
    transition: 'width 1s ease-in-out',
    display: 'flex',
    justifyContent: 'center',
    backgroundImage: "linear-gradient(45deg, #d0910a, #a801ff)",
  }

  const labelStyles = {
    position: 'absolute',
    right: 0,
    padding: 5,
    color: 'grey',
    fontWeight: 'bold',
  }

  return (
    <div style ={containerStyles}>
      <div style ={fillerStyles}>
        <span style={labelStyles}>{`${completed}%`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;