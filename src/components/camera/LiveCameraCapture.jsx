import { useEffect, useRef, useState, useCallback } from 'react';
import './LiveCameraCapture.css';

const MAX_BYTES = 800 * 1024; // 800KB target, per the anti-fraud spec

/**
 * Live weighing-scale photo capture.
 *
 * Important, stated plainly: this genuinely prevents gallery uploads —
 * it uses a live getUserMedia video stream and canvas snapshot, never
 * a file picker, so there's no "choose from gallery" step to bypass.
 * The GPS/timestamp/Lot ID watermark and Pending_Verification status
 * are real. What this CANNOT guarantee on its own: that the device's
 * GPS or clock wasn't spoofed before the browser read them. Closing
 * that gap needs server-side cross-checks (e.g. comparing against
 * carrier/IP-based location, rejecting timestamps that drift from
 * server time) — that's backend work, not something a browser can do
 * by itself. Until that exists, treat captures as "farmer-submitted
 * evidence", not cryptographic proof.
 *
 * Falls back to a camera-biased file input (capture="environment")
 * only if getUserMedia is unavailable (unsupported browser, or denied
 * permission) — that fallback is a weaker guarantee since some mobile
 * browsers still surface a gallery option there, which is disclosed
 * to the farmer in the UI when it happens.
 */
const LiveCameraCapture = ({ lotId, onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [phase, setPhase] = useState(() =>
    navigator.mediaDevices?.getUserMedia ? 'starting' : 'fallback'
  ); // starting | live | fallback | processing
  const [locationText, setLocationText] = useState(() =>
    'geolocation' in navigator ? 'Locating…' : 'Location not supported on this device'
  );
  const [coords, setCoords] = useState(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const { latitude, longitude } = pos.coords;
          setCoords({ latitude, longitude });
          setLocationText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        },
        () => {
          if (cancelled) return;
          setLocationText('Location unavailable');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setPhase('live');
      } catch {
        if (!cancelled) setPhase('fallback');
      }
    }

    if (navigator.mediaDevices?.getUserMedia) {
      startCamera();
    }

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishWithBlob = useCallback(async (blob, width, height) => {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const now = new Date();
    const lines = [
      lotId ? `Lot: ${lotId}` : null,
      `GPS: ${locationText}`,
      now.toLocaleString(),
    ].filter(Boolean);

    const padding = 10;
    const lineHeight = Math.max(14, Math.round(height * 0.028));
    const fontSize = Math.max(12, Math.round(height * 0.024));
    const boxHeight = lines.length * lineHeight + padding * 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, height - boxHeight, Math.min(width, 340), boxHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.fillText(line, padding, height - boxHeight + padding + i * lineHeight);
    });

    let quality = 0.9;
    let finalBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    while (finalBlob && finalBlob.size > MAX_BYTES && quality > 0.3) {
      quality -= 0.1;
      finalBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    }

    const reader = new FileReader();
    reader.onload = () => {
      onCapture({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        image: reader.result,
        sizeBytes: finalBlob.size,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        lotId: lotId || null,
        capturedAt: now.toISOString(),
        status: 'Pending_Verification',
        source: phase === 'fallback' ? 'file_input_fallback' : 'live_camera',
      });
    };
    reader.readAsDataURL(finalBlob);
  }, [coords, locationText, lotId, onCapture, phase]);

  const handleCaptureFromVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    setPhase('processing');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    stopStream();
    await finishWithBlob(blob, video.videoWidth, video.videoHeight);
  };

  const handleFallbackFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhase('processing');
    const bitmap = await createImageBitmap(file);
    await finishWithBlob(file, bitmap.width, bitmap.height);
  };

  const handleCancel = () => {
    stopStream();
    onCancel();
  };

  return (
    <div className="camera-capture">
      <div className="camera-capture__stage">
        {phase === 'starting' && (
          <div className="camera-capture__status">Starting camera…</div>
        )}

        {phase === 'live' && (
          <>
            <video ref={videoRef} className="camera-capture__video" muted playsInline />
            <div className="camera-capture__watermark-preview">
              {lotId ? `Lot: ${lotId} \u2022 ` : ''}{locationText}
            </div>
          </>
        )}

        {phase === 'fallback' && (
          <div className="camera-capture__status camera-capture__status--fallback">
            <p>Live in-app camera isn't available in this browser.</p>
            <p className="camera-capture__hint">
              Falling back to your device camera app — on some phones this may also show your
              gallery, unlike the in-app capture above.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFallbackFile}
              style={{ display: 'none' }}
            />
            <button type="button" className="btn btn--primary btn--sm" onClick={() => fileInputRef.current?.click()}>
              Open Camera
            </button>
          </div>
        )}

        {phase === 'processing' && (
          <div className="camera-capture__status">Watermarking &amp; compressing…</div>
        )}
      </div>

      <div className="camera-capture__actions">
        {phase === 'live' && (
          <button type="button" className="btn btn--primary" onClick={handleCaptureFromVideo}>
            Capture Weighing Photo
          </button>
        )}
        <button type="button" className="btn btn--outline btn--sm" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LiveCameraCapture;
