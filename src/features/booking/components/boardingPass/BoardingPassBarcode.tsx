import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

/**
 * Code 39 patterns for A–Z, 0–9, and a few punctuation marks.
 * Each pattern is 9 bits: 1 = wide bar/space, 0 = narrow (alternating bar/space).
 */
const CODE39: Record<string, string> = {
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  A: '100001001',
  B: '001001001',
  C: '101001000',
  D: '000011001',
  E: '100011000',
  F: '001011000',
  G: '000001101',
  H: '100001100',
  I: '001001100',
  J: '000011100',
  K: '100000011',
  L: '001000011',
  M: '101000010',
  N: '000010011',
  O: '100010010',
  P: '001010010',
  Q: '000000111',
  R: '100000110',
  S: '001000110',
  T: '000010110',
  U: '110000001',
  V: '011000001',
  W: '111000000',
  X: '010010001',
  Y: '110010000',
  Z: '011010000',
  '-': '010000101',
  '.': '110000100',
  ' ': '011000100',
  '*': '010010100',
  $: '010101000',
  '/': '010100010',
  '+': '010001010',
  '%': '000101010',
};

function normalizeForCode39(value: string): string {
  return value
    .toUpperCase()
    .split('')
    .map((char) => (CODE39[char] ? char : '-'))
    .join('');
}

function buildBarRects(payload: string): { x: number; width: number; key: string }[] {
  const data = `*${normalizeForCode39(payload)}*`;
  const narrow = 1;
  const wide = 3;
  const rects: { x: number; width: number; key: string }[] = [];
  let x = 0;

  data.split('').forEach((char, charIndex) => {
    const pattern = CODE39[char] ?? CODE39['-'] ?? '000110100';
    pattern.split('').forEach((bit, bitIndex) => {
      const width = bit === '1' ? wide : narrow;
      if (bitIndex % 2 === 0) {
        rects.push({ x, width, key: `${charIndex}-${bitIndex}` });
      }
      x += width;
    });
    if (charIndex < data.length - 1) {
      x += narrow;
    }
  });

  return rects;
}

export interface BoardingPassBarcodeProps {
  /** Safe scan payload — never PII. */
  payload: string;
  height?: number;
  label?: string;
}

/**
 * Print-friendly Code 39 barcode rendered as SVG (no extra dependency).
 */
export function BoardingPassBarcode({
  payload,
  height = 56,
  label = 'Boarding barcode',
}: BoardingPassBarcodeProps) {
  const { rects, totalWidth } = useMemo(() => {
    const nextRects = buildBarRects(payload);
    const last = nextRects[nextRects.length - 1];
    const width = last ? last.x + last.width : 1;
    return { rects: nextRects, totalWidth: Math.max(width, 1) };
  }, [payload]);

  return (
    <Box sx={{ width: '100%', maxWidth: 320 }}>
      <Box
        component="svg"
        role="img"
        aria-label={`${label}: ${payload}`}
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="none"
        sx={{
          display: 'block',
          width: '100%',
          height,
          bgcolor: '#fff',
        }}
      >
        <rect x={0} y={0} width={totalWidth} height={height} fill="#fff" />
        {rects.map((bar) => (
          <rect
            key={bar.key}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="#0f172a"
          />
        ))}
      </Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 0.75,
          textAlign: 'center',
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.08em',
          wordBreak: 'break-all',
        }}
      >
        {payload}
      </Typography>
    </Box>
  );
}
