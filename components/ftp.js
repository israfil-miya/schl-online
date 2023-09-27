import jsftp from 'jsftp';
import fs from 'fs';

const ftp = new jsftp({
  host: process.env.NEXT_PUBLIC_HOST,
  port: 21,
  user: process.env.NEXT_PUBLIC_USERNAME,
  pass: process.env.NEXT_PUBLIC_PASSWORD,
});

export const uploadInvoice = async (localFilePath, remoteFilePath) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(localFilePath);
    const remoteWriteStream = ftp.createWriteStream(remoteFilePath);

    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('close', () => {
      resolve('Upload completed');
    });

    remoteWriteStream.on('error', (err) => {
      reject(err);
    });
  });
};

export const listInvoices = async (remoteDirectory) => {
  return new Promise((resolve, reject) => {
    ftp.list(remoteDirectory, (err, list) => {
      if (err) {
        reject(err);
      } else {
        const fileNames = list.map((item) => item.name);
        resolve(fileNames);
      }
    });
  });
};
