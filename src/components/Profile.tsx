import React from 'react';
import styled from 'styled-components';
import Button from './Button';
import { FlexItem } from './FlexCSS';

const ProfileCSS = styled.div`
  display: flex;
  flex-flow: row wrap;

  &:hover {
  }

  &:active {
  }
`;

interface Props {
  text: string;
  onRun: (T) => void;
  onDelete: (T) => void;
}

function Profile(props: Props) {
  const { text, onRun, onDelete } = props;

  return (
    <>
      {text ? (
        <ProfileCSS>
          <FlexItem>{text}</FlexItem>
          <FlexItem>
            <Button click={() => onRun(text)} text="run" />
          </FlexItem>
          <FlexItem>
            <Button click={() => onDelete(text)} text="delete" />
          </FlexItem>
        </ProfileCSS>
      ) : null}
    </>
  );
}

export default Profile;
