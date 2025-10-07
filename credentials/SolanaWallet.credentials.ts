import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SolanaWallet implements ICredentialType {
	name = 'solanaWallet';
	displayName = 'Solana Wallet';
	documentationUrl = 'https://docs.solana.com/wallet-guide';
	properties: INodeProperties[] = [
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			placeholder: '5Kj9x7HsAb3d... (base58 format)',
			description: 'Your Solana wallet private key in base58 format. This wallet will be used to pay for certifications in CHECKHC tokens.',
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet-beta',
				},
				{
					name: 'Devnet',
					value: 'devnet',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
			],
			default: 'mainnet-beta',
			description: 'Solana network to connect to. Use mainnet-beta for production.',
		},
		{
			displayName: 'RPC URL',
			name: 'rpcUrl',
			type: 'string',
			default: 'https://api.mainnet-beta.solana.com',
			required: true,
			placeholder: 'https://api.mainnet-beta.solana.com',
			description: 'Solana RPC endpoint URL. For better performance, use a private RPC (Helius, QuickNode, etc.).',
		},
		{
			displayName: 'How to get your private key?',
			name: 'infoNotice',
			type: 'notice',
			default: `
				<strong>From Phantom Wallet:</strong><br/>
				1. Open Phantom → Settings → Security & Privacy<br/>
				2. Click "Export Private Key"<br/>
				3. Copy the private key (base58 format)<br/><br/>
				
				<strong>Create a new wallet:</strong><br/>
				Use Solana CLI: <code>solana-keygen new</code><br/><br/>
				
				<strong>⚠️ Security:</strong><br/>
				• Use a dedicated wallet for n8n (not your main wallet)<br/>
				• Store only necessary CHECKHC tokens<br/>
				• Never share your private key
			`,
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.mainnet-beta.solana.com',
			url: '',
			method: 'POST',
		},
	};
}
