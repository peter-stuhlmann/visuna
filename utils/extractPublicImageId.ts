// Hilfsfunktion: Extrahiert die Cloudinary public_id aus der URL
const extractPublicImageId = (url: string): string | null => {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) return null;
    // Zusammensetzen des Teils nach "upload/"
    let publicIdWithExtension = parts.slice(uploadIndex + 1).join('/');
    // Entferne einen möglichen Versionspfad (z. B. "v1620000000/")
    publicIdWithExtension = publicIdWithExtension.replace(/v\d+\//, '');
    // Entferne die Dateiendung (z. B. ".jpg")
    const dotIndex = publicIdWithExtension.lastIndexOf('.');
    if (dotIndex !== -1) {
      return publicIdWithExtension.substring(0, dotIndex);
    }
    return publicIdWithExtension;
  } catch (error) {
    console.error('Fehler beim Extrahieren der public_id aus der URL:', error);
    return null;
  }
};

export default extractPublicImageId;
