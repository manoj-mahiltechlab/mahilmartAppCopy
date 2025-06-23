export function getImageSource(image: any): { uri: string } {
  const fallbackUri = 'https://via.placeholder.com/150?text=Image+Not+Available';

  if (typeof image === 'string' && image.trim().startsWith('http')) {
    return { uri: image.trim() };
  }

  if (typeof image === 'object' && image !== null) {
    if (typeof image.uri === 'string' && image.uri.trim().startsWith('http')) {
      return { uri: image.uri.trim() };
    }
    if (
      typeof image?.uri?.uri === 'string' &&
      image.uri.uri.trim().startsWith('http')
    ) {
      return { uri: image.uri.uri.trim() };
    }
  }

  return { uri: fallbackUri };
}
