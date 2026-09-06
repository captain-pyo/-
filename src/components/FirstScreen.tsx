import React from 'react';
import { ConsultationForm } from '../types';
import { LandingPage } from './LandingPage';

interface FirstScreenProps {
  onStart: () => void;
  onLoadSample: (sample: ConsultationForm) => void;
  apiKey?: string;
  isKeyVerified?: boolean;
  onKeyVerified?: (key: string) => void;
  onKeyReset?: () => void;
}

export const FirstScreen: React.FC<FirstScreenProps> = ({
  onStart,
  onLoadSample,
  apiKey = '',
  isKeyVerified = false,
  onKeyVerified = () => {},
  onKeyReset = () => {},
}) => {
  return (
    <LandingPage
      onStart={onStart}
      onLoadSample={onLoadSample}
      apiKey={apiKey}
      isKeyVerified={isKeyVerified}
      onKeyVerified={onKeyVerified}
      onKeyReset={onKeyReset}
    />
  );
};

