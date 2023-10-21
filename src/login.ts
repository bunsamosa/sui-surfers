import { generateNonce, generateRandomness } from '@mysten/zklogin';

const REDIRECT_URI = 'http://localhost:3000';
const CLIENT_ID = '818186714890-2ku28iumet7pstg8vubvhbkmroett5mq.apps.googleusercontent.com'


const FULLNODE_URL = 'https://fullnode.devnet.sui.io'; // replace with the RPC URL you want to use
const suiClient = new suiClient({ url: FULLNODE_URL });
const { epoch, epochDurationMs, epochStartTimestampMs } = await suiClient.getLatestSuiSystemState();

const maxEpoch = Number(epoch) + 2; // this means the ephemeral key will be active for 2 epochs from now.
const ephemeralKeyPair = new Ed25519Keypair();
const randomness = generateRandomness();
const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

const params = new URLSearchParams({
   // See below for how to configure client ID and redirect URL
   client_id: $CLIENT_ID,
   redirect_uri: $REDIRECT_URL,
   response_type: 'id_token',
   scope: 'openid',
   // See below for details about generation of the nonce
   nonce: nonce,
});

const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
