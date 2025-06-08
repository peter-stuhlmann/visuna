import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 25px;
  box-sizing: border-box;
  border-radius: 8px;
  text-align: center;
  max-width: 700px;
  width: calc(100% - 50px);

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const ModalActions = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;
