import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export interface BookingETicketQrProps {
  /** Safe booking-identifier payload only — never PII. */
  payload: string;
  size?: number;
  label?: string;
}

/**
 * Renders a QR code from a safe booking identifier (SVG, print-friendly).
 */
export function BookingETicketQr({
  payload,
  size = 144,
  label = 'Boarding QR',
}: BookingETicketQrProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void QRCode.toString(payload, {
      type: 'svg',
      margin: 1,
      width: size,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((value) => {
        if (!cancelled) {
          setSvg(value);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSvg(null);
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

  if (!svg) {
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
      role="img"
      aria-label={`${label}: ${payload}`}
      sx={{
        width: size,
        height: size,
        lineHeight: 0,
        '& svg': { width: '100%', height: '100%', display: 'block' },
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
