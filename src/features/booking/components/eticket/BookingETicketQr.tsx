import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

export interface BookingETicketQrProps {
  /** Safe booking-identifier payload only — never PII. */
  payload: string;
  size?: number;
  label?: string;
}

/**
 * Renders a QR code from a safe booking identifier (PNG data URL).
 * Uses an `<img>` instead of `dangerouslySetInnerHTML` to avoid XSS via SVG markup.
 * Loads `qrcode` on demand so it stays out of the initial bundle.
 */
export function BookingETicketQr({
  payload,
  size = 144,
  label = 'Boarding QR',
}: BookingETicketQrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(payload, {
          margin: 1,
          width: size,
          errorCorrectionLevel: 'M',
          color: { dark: '#0f172a', light: '#ffffff' },
        }),
      )
      .then((value) => {
        if (!cancelled) {
          setDataUrl(value);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  if (error) {
    return (
      <Box
        role="img"
        aria-label={`${label} unavailable`}
        sx={{
          width: size,
          height: size,
          border: 1,
          borderColor: 'divider',
          display: 'grid',
          placeItems: 'center',
          p: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          QR unavailable
        </Typography>
      </Box>
    );
  }

  if (!dataUrl) {
    return (
      <Box
        aria-hidden
        sx={{
          width: size,
          height: size,
          bgcolor: 'action.hover',
          borderRadius: 0.5,
        }}
      />
    );
  }

  return (
    <Box
      component="img"
      src={dataUrl}
      alt={`${label}: ${payload}`}
      width={size}
      height={size}
      sx={{
        width: size,
        height: size,
        display: 'block',
      }}
    />
  );
}
