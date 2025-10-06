import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PhotoCertifApi implements ICredentialType {
	name = 'photoCertifApi';
	displayName = 'PhotoCertif API';
	documentationUrl = 'https://photocertif.com/docs/api';
	properties: INodeProperties[] = [
		{
			displayName: 'PhotoCertif URL',
			name: 'photoCertifUrl',
			type: 'string',
			default: 'https://app2.photocertif.com',
			placeholder: 'https://app2.photocertif.com',
			description: 'The URL of your PhotoCertif instance',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'pk_live_xxxxxxxxxxxxx',
			description: 'PhotoCertif API Key (generate from My Account → API Keys)',
			required: true,
		},
		{
			displayName: 'Solana Wallet Private Key',
			name: 'walletPrivateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Base58 encoded private key',
			description: 'Solana wallet private key for signing NFT transactions (keep secure!)',
			required: true,
		},
		{
			displayName: 'Solana Network',
			name: 'solanaNetwork',
			type: 'options',
			options: [
				{
					name: 'Mainnet Beta',
					value: 'mainnet-beta',
				},
				{
					name: 'Devnet',
					value: 'devnet',
				},
			],
			default: 'mainnet-beta',
			description: 'Solana network to use for NFT minting',
		},
	];

	authenticate = {
		type: 'generic' as const,
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test = {
		request: {
			baseURL: '={{$credentials.photoCertifUrl}}',
			url: '/api/health',
			method: 'GET' as const,
		},
	};
}
