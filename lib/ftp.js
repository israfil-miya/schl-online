import PromiseFtp from 'promise-ftp';

const MAX_CONNECTIONS = 6; // Set your desired maximum number of connections
const connectionPool = [];
const connectionQueue = [];
let isConnecting = false;

async function getConnection() {
  if (connectionPool.length > 0) {
    return connectionPool.pop();
  }

  if (isConnecting || connectionQueue.length >= MAX_CONNECTIONS) {
    return new Promise((resolve) => connectionQueue.push(resolve));
  }

  const ftp = new PromiseFtp();

  try {
    isConnecting = true;
    await ftp.connect({
      host: process.env.NEXT_PUBLIC_HOST,
      user: process.env.NEXT_PUBLIC_USERNAME,
      password: process.env.NEXT_PUBLIC_PASSWORD,
    });
    isConnecting = false;
    return ftp;
  } catch (error) {
    isConnecting = false;
    console.error('FTP connection error:', error);
    throw error;
  }
}

async function releaseConnection(ftp) {
  try {
    const connectionStatus = await ftp.getConnectionStatus(); // Check the connection status.

    if (connectionStatus === 'connected' && connectionPool.length < MAX_CONNECTIONS) {
      connectionPool.push(ftp);
    } else {
      await ftp.end();
    }

    if (connectionQueue.length > 0) {
      const { resolve, reject } = connectionQueue.shift();
      resolve(ftp);
    }
  } catch (error) {
    console.error('Error while releasing connection:', error);
    if (connectionQueue.length > 0) {
      const { reject } = connectionQueue.shift();
      reject(error);
    }
  }
}

export { getConnection, releaseConnection };
