import PromiseFtp from 'promise-ftp';

async function connectFtp() {
  const ftp = new PromiseFtp();

  try {
    if (ftp.getConnectionStatus() !== 'connected') {
      await ftp.connect({
        host: process.env.NEXT_PUBLIC_HOST,
        user: process.env.NEXT_PUBLIC_USERNAME,
        password: process.env.NEXT_PUBLIC_PASSWORD,
      });
    }

    return ftp;
  } catch (error) {
    // Handle errors properly
    console.error('FTP connection error:', error);
    throw error; // Re-throw the error for higher-level handling, if needed
  }
}

export default connectFtp;
