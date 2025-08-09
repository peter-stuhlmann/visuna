'use client';

import { FC, useRef, useEffect, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  SignatureWrapper,
  ValidationIconWapper,
} from './SignatureInput.styles';
import CheckIcon from './icons/CheckIcon';
import ErrorIcon from './icons/ErrorIcon';
import { SignatureInputProps } from './SignatureInput.types';
import { Button } from '@/components/content-elements/default';

const SignatureInput: FC<SignatureInputProps> = ({
  label,
  // name,
  onChange,
  clearSignatureText,
  error,
  // required,
  requiredMessage,
}) => {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isSignatureValid, setIsSignatureValid] = useState(false);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setIsSignatureValid(false);
    onChange('');
  };

  const handleEndStroke = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL();
      const points = dataURL.length;

      // Setze einen Schwellenwert für die Länge der Signaturdaten
      setIsSignatureValid(points > 500);

      if (points > 500) {
        onChange(dataURL);
      }
    }
  };

  const resizeCanvas = useCallback(() => {
    if (wrapperRef.current && sigCanvas.current) {
      const { offsetWidth } = wrapperRef.current;
      const canvas = sigCanvas.current.getCanvas();
      const ratio = canvas.height / canvas.width;

      // Speichern der aktuellen Signatur
      const dataURL = sigCanvas.current.toDataURL();

      // Ändern der Canvas-Größe
      canvas.width = offsetWidth;
      canvas.height = offsetWidth * ratio;

      // Zeichnen der gespeicherten Signatur
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = dataURL;
      }
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  return (
    <>
      <div>
        <div>{label}</div>
        <SignatureWrapper ref={wrapperRef} $error={error}>
          <ValidationIconWapper $isValid={isSignatureValid}>
            {isSignatureValid ? <CheckIcon /> : <ErrorIcon />}
          </ValidationIconWapper>
          <SignatureCanvas
            penColor="black"
            ref={sigCanvas}
            onEnd={handleEndStroke}
            canvasProps={{
              className: 'signatureCanvas',
            }}
          />
          <Button type="button" variant="text" onClick={clearSignature}>
            {clearSignatureText}
          </Button>
          {error && <p>{requiredMessage}</p>}
        </SignatureWrapper>
      </div>
    </>
  );
};

export default SignatureInput;
