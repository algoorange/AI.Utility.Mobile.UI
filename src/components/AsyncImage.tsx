import React from 'react';
import { Image, ImageProps } from 'react-native';

interface AsyncImageProps extends ImageProps {
  fallback?: string;
}

export const AsyncImage: React.FC<AsyncImageProps> = ({ fallback, ...props }) => {
  return <Image defaultSource={fallback ? { uri: fallback } : undefined} {...props} />;
};

