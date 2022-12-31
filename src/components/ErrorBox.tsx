import React from 'react';
import styled from 'styled-components';

const ErrorBoxCSS = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: tomato;
  color: white;
  width: 100%;
  height: 2.5rem;
`;

interface Props {
  text: string;
}

function ErrorBox(props: Props) {
  const { text } = props;
  return <>{text ? <ErrorBoxCSS>{text}</ErrorBoxCSS> : null}</>;
}

export default ErrorBox;
