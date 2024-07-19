import sharp from 'sharp';
import { GridFSBucket, GridFSFile } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

async function rescaleCoverImage(coverImage: string): Promise<string> {
  const base64Data = coverImage.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const resizedImageBuffer = await sharp(buffer).resize(300).toBuffer();
  const resizedImageBase64 = resizedImageBuffer.toString('base64');
  return `data:image/jpeg;base64,${resizedImageBase64}`;
}

async function uploadImageToGridFS(bucket: GridFSBucket, imageData: string) {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(imageData, 'base64');
    const filename = `${uuidv4()}.jpg`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: 'image/jpeg'
    });
    uploadStream.write(buffer);
    uploadStream.end();
    uploadStream.on('finish', (file: GridFSFile) => {
      resolve(file._id);
    });
    uploadStream.on('error', err => {
      reject(err);
    });
  });
}

export { rescaleCoverImage, uploadImageToGridFS };
