import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hls, { Events } from 'hls.js';

import playIcon from '@/assets/icons/playIcon.png';
import DefaultPreviewImage from '@/assets/images/defaultPreviewImage.png';
import { formatDuration } from '@/utils/format';

import './StreamPreview.scss';

const THUMBNAIL_RETRY_COUNT = 10;
const THUMBNAIL_RETRY_TIMEOUT = 2000;

interface StreamPreviewProps {
  manifestUrl: string;
  owner: string;
  topic: string;
  state?: string;
  duration?: string;
  mediatype: 'audio' | 'video';
  title: string;
}

export const StreamPreview = ({ manifestUrl, owner, topic, state, duration, mediatype, title }: StreamPreviewProps) => {
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailHls = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const retryCount = useRef(0);

  const captureThumbnail = async () => {
    if (!videoRef.current) return;

    try {
      thumbnailHls.current = new Hls();
      thumbnailHls.current.attachMedia(videoRef.current);
      thumbnailHls.current.loadSource(manifestUrl);

      thumbnailHls.current.on(Events.FRAG_CHANGED, () => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.pause();
          setShowThumbnail(true);
          setIsLoading(false);

          // Stop further loading
          thumbnailHls.current?.stopLoad();
          setIsDataAvailable(true);
        }
      });

      thumbnailHls.current.on(Events.ERROR, (event) => {
        console.error('Error loading thumbnail', event);
        if (!isDataAvailable && retryCount.current < THUMBNAIL_RETRY_COUNT) {
          retryCount.current += 1;
          setTimeout(() => {
            captureThumbnail();
          }, THUMBNAIL_RETRY_TIMEOUT);
        } else {
          setIsLoading(false);
          thumbnailHls.current?.stopLoad();
        }
      });
    } catch (error) {
      console.error('Thumbnail capture failed:', error);
      setIsLoading(false);
    }
  };

  const handlePlayToggle = () => {
    navigate(`/watch/${mediatype}/${owner}/${topic}`);
  };

  useEffect(() => {
    captureThumbnail();
    return () => {
      thumbnailHls.current?.destroy();
    };
  }, [manifestUrl]);

  return (
    <div className="stream-preview" onClick={handlePlayToggle}>
      {isLoading && (
        <div className="stream-preview-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <video ref={videoRef} className="stream-preview-video" controls={false} muted playsInline />

      {showThumbnail && !isLoading && isDataAvailable && (
        <div className="stream-preview-button-wrapper">
          <img src={playIcon} alt="play-icon" />
          <div className="stream-preview-button">
            <span className="stream-preview-button-title">{title}</span>
            {state === 'live' && <span className="stream-preview-button-state">{state}</span>}
            {duration && (
              <span className="stream-preview-button-duration">{formatDuration(Number.parseFloat(duration))}</span>
            )}
          </div>
        </div>
      )}
      {showThumbnail && !isLoading && !isDataAvailable && (
        <div className="stream-preview-error">
          <img src={DefaultPreviewImage} alt="" />
        </div>
      )}
    </div>
  );
};
