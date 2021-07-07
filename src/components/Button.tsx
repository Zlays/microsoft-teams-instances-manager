import React from 'react';
import styled from 'styled-components';

const ButtonCSS = styled.div`
  box-shadow: inset 0px 39px 0px -24px #3d78a0;
  background-color: #3174c7;
  border-radius: 4px;
  border: 1px solid #ffffff;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: Arial;
  font-size: 15px;
  padding: 6px 15px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #3558b2;

  &:hover {
    background-color: #4b7fbf;
  }

  &:active {
    position: relative;
    top: 1px;
  }
`;

interface Props {
  text: string;
  click: (T: void) => void;
}

function Button(props: Props) {
  const { text, click } = props;
  return (
    <>
      <ButtonCSS onClick={click}>{text}</ButtonCSS>
    </>
  );
}

export default Button;
