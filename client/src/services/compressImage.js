/**
 * Comprime uma imagem via Canvas antes do upload.
 * Garante que o ficheiro enviado fica sempre dentro do limite do servidor.
 *
 * @param {File} file - Ficheiro original do input
 * @param {number} maxWidth - Largura máxima em px (default: 1200)
 * @param {number} quality - Qualidade JPEG 0-1 (default: 0.82)
 * @returns {Promise<File>} - Ficheiro comprimido como JPEG
 */
const compressImage = (file, maxWidth = 1200, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Redimensionar se exceder maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Falha na compressão da imagem.'));
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            );
            const originalKB = (file.size / 1024).toFixed(0);
            const compressedKB = (compressed.size / 1024).toFixed(0);
            console.log(`📦 [compressImage] ${originalKB}KB → ${compressedKB}KB (${width}px, q=${quality})`);
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem para compressão.'));
    };
    reader.onerror = () => reject(new Error('Erro ao ler ficheiro de imagem.'));
  });

export default compressImage;
