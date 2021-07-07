import styled from 'styled-components';

const Root = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  align-content: space-between;
  align-items: flex-start;
  width: 100vw;
  height: 100vh;
`;

const FlexItem = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  margin: 2px 4px;
`;

const FlexBottomItem = styled.div`
  align-self: flex-end;
  place-self: flex-end;
  justify-self: flex-end;

  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
`;

export { FlexItem, Row, Root, FlexBottomItem };
