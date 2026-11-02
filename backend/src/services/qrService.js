import QRCode from 'qrcode';

export const generateBookingQRCode = async ({ bookingId, verificationCode, userId }) => {
  const payload = JSON.stringify({
    bid: bookingId,
    code: verificationCode,
    uid: userId,
    app: 'EV_HUB_VERIFY',
    ts: Date.now(),
  });

  try {
    // Generate high-contrast, dark-mode-compatible QR Code data URL
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#090B0A',
        light: '#39F28A',
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error('[QR] Failed to generate QR Code:', err);
    return '';
  }
};

