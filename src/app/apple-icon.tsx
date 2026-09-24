import { ImageResponse } from 'next/og';

/**
 * Icono para la pantalla de inicio de iOS.
 *
 * iOS no admite SVG como `apple-touch-icon`, así que se genera un PNG en el
 * build a partir del mismo monograma, en lugar de mantener otro fichero
 * binario que pueda quedarse desactualizado respecto al logo.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#121212',
        color: '#59b2f4',
        fontSize: 74,
        fontWeight: 800,
        letterSpacing: '-0.04em',
        fontFamily: 'sans-serif',
      }}
    >
      DL
    </div>,
    size,
  );
}
