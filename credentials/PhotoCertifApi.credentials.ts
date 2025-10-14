import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PhotoCertifApi implements ICredentialType {
	name = 'photoCertifApi';
	displayName = 'PhotoCertif API';
	documentationUrl = 'https://photocertif.com/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'PhotoCertif URL',
			name: 'photoCertifUrl',
			type: 'string',
			default: 'https://app2.photocertif.com',
			placeholder: 'https://app2.photocertif.com',
			description: 'The base URL of your PhotoCertif instance',
			required: true,
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
			description: 'Your PhotoCertif API Key. Generate one in PhotoCertif → My Account → API Keys. Required scopes: docs:read, docs:upload, docs:write',
			required: true,
		},
		{
			displayName: 'Pinata API Key',
			name: 'pinataApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Your Pinata JWT or API Key',
			description: 'Optional: Pinata API Key for IPFS uploads. Leave empty if not using Pinata.',
			required: false,
		},
		{
			displayName: 'Pinata Secret Key',
			name: 'pinataSecretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Your Pinata Secret Key',
			description: 'Optional: Pinata Secret Key (only needed with API Key auth method, not JWT)',
			required: false,
		},
		{
			displayName: 'Important Notice',
			name: 'notice',
			type: 'notice',
			default: '',
			// @ts-ignore
			text: '⚠️ This node submits certification requests only. The user must complete payment and NFT minting manually in the PhotoCertif interface. Use "Wait for Certification" operation to poll for completion.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.photoCertifUrl}}',
			url: '/api/auth/test',
			method: 'GET',
		},
	};
}
