'use client';

import styled from 'styled-components';

export const Container = styled.li`
  list-style-type: none;
  margin: 0;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  text-align: left;

  & > h3 {
    font-size: 1.2rem;
    margin: 0;
  }

  & > div {
    p {
      margin: 0;
    }
  }
`;
