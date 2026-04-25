// src/components/common/CachedImage.jsx
import React, { useState, useEffect } from 'react';

const CACHE_NAME = 'jayledger-image-cache';
const inflightRequests = new Map();

const CachedImage = ({ src, alt, style, className, fallbackIcon, ...props }) => {
  const [cachedSrc, setCachedSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let objectUrl = null;

    const loadImage = async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(src);

        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (isMounted) {
            objectUrl = URL.createObjectURL(blob);
            setCachedSrc(objectUrl);
            setLoading(false);
          }
          return;
        }

        // Handle inflight requests to deduplicate network calls
        if (inflightRequests.has(src)) {
          const blob = await inflightRequests.get(src);
          if (isMounted && blob) {
            objectUrl = URL.createObjectURL(blob);
            setCachedSrc(objectUrl);
            setLoading(false);
          }
          return;
        }

        // New fetch request
        const fetchPromise = (async () => {
          try {
            const response = await fetch(src, { mode: 'cors' });
            if (response.ok) {
              const responseToCache = response.clone();
              await cache.put(src, responseToCache);
              return await response.blob();
            }
          } catch (e) {
            // Fallback for CORS issues if possible, or just fail
            console.warn(`Failed to fetch image with CORS: ${src}`, e);
          }
          return null;
        })();

        inflightRequests.set(src, fetchPromise);
        const blob = await fetchPromise;
        inflightRequests.delete(src);

        if (isMounted) {
          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setCachedSrc(objectUrl);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Image caching error:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!src || error) {
    return (
      <div 
        style={{ 
          ...style, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: style?.borderRadius || '8px'
        }} 
        className={className}
      >
        {fallbackIcon}
      </div>
    );
  }

  // Use a placeholder or nothing while loading to avoid double loading the raw URL
  if (loading) {
    return (
      <div 
        style={{ 
          ...style, 
          background: 'rgba(0,0,0,0.03)',
          borderRadius: style?.borderRadius || '8px'
        }} 
        className={className}
      />
    );
  }

  return (
    <img 
      src={cachedSrc || src} 
      alt={alt} 
      style={{ ...style, transition: 'opacity 0.3s' }} 
      className={className}
      {...props}
      onError={() => setError(true)}
    />
  );
};

export default CachedImage;
