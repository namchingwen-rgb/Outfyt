/** Image upload and processing utilities */

const MAX_SIZE = 400; // max dimension in pixels
const QUALITY = 0.7;

export function pickImage() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (!input.files.length) return resolve(null);
      const data = await resizeToBase64(input.files[0]);
      resolve(data);
    };
    input.click();
  });
}

export function resizeToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round(height * MAX_SIZE / width);
            width = MAX_SIZE;
          } else {
            width = Math.round(width * MAX_SIZE / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function createPlaceholder(category) {
  const icons = {
    tops: '&#128085;',
    bottoms: '&#128086;',
    dresses: '&#128087;',
    outerwear: '&#129509;',
    shoes: '&#128094;',
    accessories: '&#128092;'
  };
  return icons[category] || '&#128090;';
}
