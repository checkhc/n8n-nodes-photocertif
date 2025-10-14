import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import axios from 'axios';
import * as https from 'https';

// Security and Performance Constants
const REQUEST_TIMEOUT = 30000;          // 30 seconds for API requests
const DOWNLOAD_TIMEOUT = 120000;        // 2 minutes for file downloads
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximum file size
const MIN_POLLING_INTERVAL = 10;        // 10 seconds minimum polling interval

/**
 * Creates axios config with HTTPS agent for self-signed certificates in local development
 * @param baseUrl - The base URL to connect to
 * @returns Axios config object with httpsAgent if needed
 */
function getAxiosConfig(baseUrl: string): { httpsAgent?: https.Agent } {
	// Allow self-signed certificates for localhost/127.0.0.1 only (development)
	if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
		return {
			httpsAgent: new https.Agent({
				rejectUnauthorized: false
			})
		};
	}
	return {};
}

/**
 * Validates URL to prevent SSRF (Server-Side Request Forgery) attacks
 * Blocks access to internal/private IPs and non-HTTP(S) protocols
 * @param urlString - URL to validate
 * @throws Error if URL is invalid or points to blocked resources
 */
function validateUrl(urlString: string): void {
	let url: URL;
	try {
		url = new URL(urlString);
	} catch {
		throw new Error('Invalid URL format');
	}
	
	// Only allow HTTP and HTTPS protocols
	if (!['http:', 'https:'].includes(url.protocol)) {
		throw new Error(`Protocol ${url.protocol} not allowed. Use HTTP or HTTPS only.`);
	}
	
	const hostname = url.hostname.toLowerCase();
	
	// Block internal/localhost IPs
	const blockedHosts = [
		'localhost',
		'127.0.0.1',
		'0.0.0.0',
		'::1',
		'169.254.169.254', // AWS metadata endpoint
	];
	
	if (blockedHosts.includes(hostname)) {
		throw new Error('Access to internal/private IPs is not allowed');
	}
	
	// Block private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
	if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
		throw new Error('Access to private IP ranges is not allowed');
	}
}

export class PhotoCertif implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PhotoCertif by CHECKHC',
		name: 'photoCertif',
		icon: 'file:photocertif.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}} - {{$parameter["resourceType"] === "image" ? "Photo (Pinata)" : "Art (Irys)"}}',
		description: 'PhotoCertif - Document and art certification on Solana blockchain with AI authentication. Developed by CHECKHC. Learn more: https://www.checkhc.net',
		defaults: {
			name: 'PhotoCertif by CHECKHC',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'photoCertifApi',
				required: true,
				displayOptions: {
					show: {},
				},
			},
			{
				name: 'solanaApi',
				required: false,
				displayOptions: {
					show: {},
				},
			},
		],
		properties: [
			// Resource Type
			{
				displayName: 'Resource Type',
				name: 'resourceType',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Photo Certification Flexible (media/image)',
						value: 'image',
						description: 'Photo certification with Pinata IPFS storage',
					},
					{
						name: 'Art Certification (media/image2)',
						value: 'image2',
						description: 'Art certification with AI analysis and Irys/Arweave permanent storage',
					},
				],
				default: 'image2',
				description: 'Type of certification flow: Pinata (image) or Irys/Arweave (image2)',
			},

			// Operation
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload content to PhotoCertif',
						action: 'Upload content',
					},
					{
						name: 'Submit Certification',
						value: 'certify',
						description: 'Submit certification form (requires user to complete payment)',
						action: 'Submit certification',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get certification status',
						action: 'Get status',
					},
					{
						name: 'Wait for Certification',
						value: 'waitForCertification',
						description: 'Poll status until certified or timeout',
						action: 'Wait for certification',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Download certified content',
						action: 'Download content',
					},
					{
						name: 'Get Pricing',
						value: 'getPricing',
						description: 'Get CHECKHC pricing for certification service',
						action: 'Get pricing',
					},
					{
						name: 'B2B Certify Full',
						value: 'b2bCertifyFull',
						description: 'Complete B2B certification (payment + Arweave + NFT)',
						action: 'B2B Certify Full',
					},
					{
						name: 'List NFTs',
						value: 'listNfts',
						description: 'List NFTs owned by wallet address',
						action: 'List NFTs',
					},
				],
				default: 'upload',
			},

			// ============================================
			// UPLOAD PARAMETERS
			// ============================================
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['upload'],
					},
				},
				options: [
					{
						name: 'URL',
						value: 'url',
						description: 'Download file from URL (Google Drive, Dropbox, CDN, etc.)',
					},
					{
						name: 'Base64 String',
						value: 'base64',
						description: 'File content as base64 encoded string',
					},
				],
				default: 'url',
				description: 'How to provide the file content',
			},
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['upload'],
						inputType: ['url'],
					},
				},
				default: '',
				placeholder: 'https://drive.google.com/uc?id=FILE_ID&export=download',
				description: 'Public URL to download the file from (Google Drive, Dropbox, or direct link)',
				required: true,
			},
			{
				displayName: 'File (Base64)',
				name: 'fileData',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['upload'],
						inputType: ['base64'],
					},
				},
				default: '',
				placeholder: 'data:image/jpeg;base64,/9j/4AAQ...',
				description: 'File as base64 string (with or without data URI prefix)',
				required: true,
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['upload'],
					},
				},
				default: '',
				placeholder: 'Document Title',
				description: 'Title for the uploaded content',
				required: true,
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['upload'],
					},
				},
				default: '',
				placeholder: 'Optional description',
				description: 'Description of the content (optional)',
			},
			{
				displayName: 'File Extension',
				name: 'fileExtension',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['upload'],
						inputType: ['url'],
					},
				},
				default: 'pdf',
				placeholder: 'pdf, zip, jpg, png, docx, etc.',
				description: 'File extension (required for URL uploads as they often lack extension)',
			},

			// ============================================
			// GET PRICING PARAMETERS
			// ============================================
			{
				displayName: 'File Size (Bytes)',
				name: 'fileSize',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getPricing'],
					},
				},
				default: 0,
				placeholder: '500000',
				description: 'Processed file size in bytes (optional, for Irys cost calculation)',
			},
			{
				displayName: 'Original File Size (Bytes)',
				name: 'originalSize',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['getPricing'],
					},
				},
				default: 0,
				placeholder: '2000000',
				description: 'Original file size in bytes (optional, for Irys cost calculation)',
			},

			// ============================================
			// CERTIFY PARAMETERS (15 fields total!)
			// ============================================
			{
				displayName: 'Storage ID',
				name: 'storageId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify', 'getStatus', 'download', 'waitForCertification'],
					},
				},
				default: '',
				placeholder: 'iv_xxxxxxxxxxxxx',
				description: 'The storage ID returned from upload',
				required: true,
			},

			// Required certification fields
			{
				displayName: 'Certification Name',
				name: 'name',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'Contract2025',
				description: 'Name for the certification (alphanumeric only)',
				required: true,
			},
			{
				displayName: 'Symbol',
				name: 'cert_symbol',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'CNTR',
				description: 'Symbol for the NFT (4 uppercase letters max)',
				required: true,
			},
			{
				displayName: 'Description',
				name: 'cert_description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'Description of the certification',
				description: 'Detailed description (alphanumeric + spaces)',
				required: true,
			},
			{
				displayName: 'Owner',
				name: 'cert_prop',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'Company ABC Inc',
				description: 'Owner name (20 characters max, alphanumeric + spaces)',
				required: true,
			},

			// Optional certification fields
			{
				displayName: 'Collection Mint Address',
				name: 'collection_mint_address',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'BMCVo8ehcpR2E92d2RUqyybQ7fMeDUWpMxNbaAsQqV8i',
				description: 'NFT Collection address (optional)',
			},

			// External Links section
			{
				displayName: 'External Links',
				name: 'externalLinksNotice',
				type: 'notice',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				// @ts-ignore
				text: 'All external links are optional and will be included in NFT metadata',
			},
			{
				displayName: 'Website URL',
				name: 'external_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://your-website.com',
				description: 'Website or project URL',
			},
			{
				displayName: 'Twitter/X URL',
				name: 'twitter_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://x.com/username',
				description: 'Twitter/X profile URL',
			},
			{
				displayName: 'Discord URL',
				name: 'discord_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://discord.gg/invite',
				description: 'Discord server invite URL',
			},
			{
				displayName: 'Instagram URL',
				name: 'instagram_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://instagram.com/username',
				description: 'Instagram profile URL',
			},
			{
				displayName: 'Telegram URL',
				name: 'telegram_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://t.me/channel',
				description: 'Telegram channel URL',
			},
			{
				displayName: 'Medium URL',
				name: 'medium_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://medium.com/@username',
				description: 'Medium blog URL',
			},
			{
				displayName: 'Wiki URL',
				name: 'wiki_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://wiki.example.com',
				description: 'Wiki or documentation URL',
			},
			{
				displayName: 'YouTube URL',
				name: 'youtube_url',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['certify'],
					},
				},
				default: '',
				placeholder: 'https://youtube.com/@channel',
				description: 'YouTube channel URL',
			},

			// ============================================
			// WAIT FOR CERTIFICATION PARAMETERS
			// ============================================
			{
				displayName: 'Polling Interval (seconds)',
				name: 'pollingInterval',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['waitForCertification'],
					},
				},
				default: 300,
				description: 'Seconds between status checks (default: 5 minutes)',
			},
			{
				displayName: 'Max Wait Time (seconds)',
				name: 'maxWaitTime',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['waitForCertification'],
					},
				},
				default: 86400,
				description: 'Maximum seconds to wait before timeout (default: 24 hours)',
			},

			// ============================================
			// B2B CERTIFY FULL PARAMETERS
			// ============================================
			{
				displayName: 'Storage ID',
				name: 'storageIdB2b',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'iv_xxxxxxxxxxxxx',
				description: 'The storage ID returned from upload',
				required: true,
			},
			{
				displayName: 'NFT Name',
				name: 'nftName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'My Document NFT',
				description: 'Name of the NFT (title)',
				required: true,
			},
			{
				displayName: 'NFT Symbol',
				name: 'nftSymbol',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: 'DOC',
				placeholder: 'DOC',
				description: 'NFT symbol (max 4 characters)',
				required: true,
			},
			{
				displayName: 'NFT Description',
				name: 'nftDescription',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'Official document certification',
				description: 'Description of the NFT',
				required: true,
			},
			{
				displayName: 'Owner Name',
				name: 'ownerName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'John Doe',
				description: 'Owner name (max 20 characters)',
				required: true,
			},
			{
				displayName: 'External URL',
				name: 'externalUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://example.com',
				description: 'External website URL (optional)',
			},
			{
				displayName: 'Twitter URL',
				name: 'twitterUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://x.com/username',
				description: 'Twitter/X profile URL (optional)',
			},
			{
				displayName: 'Discord URL',
				name: 'discordUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://discord.gg/invite',
				description: 'Discord server URL (optional)',
			},
			{
				displayName: 'Instagram URL',
				name: 'instagramUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://instagram.com/username',
				description: 'Instagram profile URL (optional)',
			},
			{
				displayName: 'Telegram URL',
				name: 'telegramUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://t.me/username',
				description: 'Telegram profile URL (optional)',
			},
			{
				displayName: 'Medium URL',
				name: 'mediumUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://medium.com/@username',
				description: 'Medium profile URL (optional)',
			},
			{
				displayName: 'Wiki URL',
				name: 'wikiUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://wiki.example.com',
				description: 'Wiki URL (optional)',
			},
			{
				displayName: 'YouTube URL',
				name: 'youtubeUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://youtube.com/@channel',
				description: 'YouTube channel URL (optional)',
			},
			{
				displayName: 'Collection Mint Address',
				name: 'collectionMintAddress',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'Collection Mint Address (optional)',
				description: 'Solana collection mint address (optional)',
			},
			{
				displayName: 'Affiliate Code',
				name: 'affiliateCode',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'Affiliate code (optional)',
				description: 'Affiliate tracking code (optional)',
			},

			// ============================================
			// LIST NFTs PARAMETERS
			// ============================================
			{
				displayName: 'Wallet Address',
				name: 'walletAddress',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['listNfts'],
					},
				},
				default: '',
				placeholder: 'Leave empty to use Solana API credential wallet',
				description: 'Solana wallet address to list NFTs from. Leave empty to automatically use the wallet from Solana API credential.',
				required: false,
			},
			{
				displayName: 'Filter by Name',
				name: 'filterName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['listNfts'],
					},
				},
				default: '',
				placeholder: 'My Document',
				description: 'Optional: Filter NFTs by name (case insensitive)',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['listNfts'],
					},
				},
				default: 50,
				description: 'Maximum number of NFTs to return (default: 50, max: 1000)',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const resourceType = this.getNodeParameter('resourceType', i, 'image2') as string;
				
				let responseData: any;
				let baseUrl: string = '';
				let apiKey: string = '';
				let endpoint: string = '';

				// Get credentials only for operations that need API access (not listNfts)
				if (operation !== 'listNfts') {
					const credentials = await this.getCredentials('photoCertifApi', i);
					baseUrl = (credentials.photoCertifUrl as string).replace(/\/$/, '');
					apiKey = credentials.apiKey as string;
					endpoint = `/api/storage/${resourceType}`;
				}

				// ============================================
				// UPLOAD OPERATION
				// ============================================
				if (operation === 'upload') {
					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;
					const inputType = this.getNodeParameter('inputType', i, 'base64') as string;
					const fileExtension = this.getNodeParameter('fileExtension', i, '') as string;

					let fileData: string;

					if (inputType === 'url') {
						// Download file from URL and convert to base64
						const fileUrl = this.getNodeParameter('fileUrl', i) as string;

						// SECURITY: Validate URL to prevent SSRF attacks
						try {
							validateUrl(fileUrl);
						} catch (error: any) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid URL: ${error.message}`,
								{ itemIndex: i },
							);
						}

						const fileResponse = await axios.get(fileUrl, {
							timeout: DOWNLOAD_TIMEOUT,
							responseType: 'arraybuffer',
							maxContentLength: MAX_FILE_SIZE,
							maxBodyLength: MAX_FILE_SIZE,
							headers: {
								'User-Agent': 'n8n-photocertif/1.0',
							},
						});

						// Detect content type from response headers or URL extension
						const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';
						const base64Data = Buffer.from(fileResponse.data).toString('base64');

						// Add data URI prefix if not present
						if (base64Data.startsWith('data:')) {
							fileData = base64Data;
						} else {
							fileData = `data:${contentType};base64,${base64Data}`;
						}
					} else {
						// Base64 input
						fileData = this.getNodeParameter('fileData', i) as string;
					}

					const requestBody: any = {
						file: fileData,
						title,
						description,
					};

					// Add file_extension if provided (important for URL uploads)
					if (fileExtension) {
						requestBody.file_extension = fileExtension;
					}

					const response = await axios.post(
						`${baseUrl}${endpoint}/upload/iv_route`,
						requestBody,
						{
							timeout: REQUEST_TIMEOUT,
							headers: {
								'Authorization': `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							...getAxiosConfig(baseUrl),
						},
					);

					responseData = response.data;
				}

				// ============================================
				// GET STATUS OPERATION
				// ============================================
				else if (operation === 'getStatus') {
					const storageId = this.getNodeParameter('storageId', i) as string;

					const response = await axios.get(
						`${baseUrl}${endpoint}/status/iv_route?id=${storageId}`,
						{
							timeout: REQUEST_TIMEOUT,
							headers: {
								'Authorization': `Bearer ${apiKey}`,
							},
							...getAxiosConfig(baseUrl),
						},
					);

					responseData = response.data;
				}

				// ============================================
				// CERTIFY OPERATION (Submit form)
				// ============================================
				else if (operation === 'certify') {
					const storageId = this.getNodeParameter('storageId', i) as string;
					const name = this.getNodeParameter('name', i) as string;
					const cert_symbol = this.getNodeParameter('cert_symbol', i) as string;
					const cert_description = this.getNodeParameter('cert_description', i) as string;
					const cert_prop = this.getNodeParameter('cert_prop', i) as string;

					// Optional fields
					const collection_mint_address = this.getNodeParameter('collection_mint_address', i, '') as string;
					const external_url = this.getNodeParameter('external_url', i, '') as string;
					const twitter_url = this.getNodeParameter('twitter_url', i, '') as string;
					const discord_url = this.getNodeParameter('discord_url', i, '') as string;
					const instagram_url = this.getNodeParameter('instagram_url', i, '') as string;
					const telegram_url = this.getNodeParameter('telegram_url', i, '') as string;
					const medium_url = this.getNodeParameter('medium_url', i, '') as string;
					const wiki_url = this.getNodeParameter('wiki_url', i, '') as string;
					const youtube_url = this.getNodeParameter('youtube_url', i, '') as string;

					const response = await axios.post(
						`${baseUrl}${endpoint}/certify/iv_route`,
						{
							id: storageId,
							name,
							cert_symbol,
							cert_description,
							cert_prop,
							cert_C2PA: false, // Not implemented yet
							collection_mint_address,
							external_url,
							twitter_url,
							discord_url,
							instagram_url,
							telegram_url,
							medium_url,
							wiki_url,
							youtube_url,
						},
						{
							timeout: REQUEST_TIMEOUT,
							headers: {
								'Authorization': `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
													...getAxiosConfig(baseUrl),
						},
					);

					responseData = {
						...response.data,
						notice: 'Certification form submitted. User must complete payment and NFT minting in PhotoCertif interface.',
						certification_url: `${baseUrl}/media/${resourceType}/certification?iv_storageid=${storageId}`,
					};
				}

				// ============================================
				// WAIT FOR CERTIFICATION (Polling)
				// ============================================
				else if (operation === 'waitForCertification') {
					const storageId = this.getNodeParameter('storageId', i) as string;
					// SECURITY: Enforce minimum polling interval to prevent API spam
					const pollingInterval = Math.max(
						MIN_POLLING_INTERVAL,
						this.getNodeParameter('pollingInterval', i, 300) as number
					);
					const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 86400) as number;

					const startTime = Date.now();
					const endTime = startTime + (maxWaitTime * 1000);

					let attempts = 0;
					let lastStatus = 'unknown';

					while (Date.now() < endTime) {
						attempts++;

						// Check status
						const statusResponse = await axios.get(
							`${baseUrl}${endpoint}/status/iv_route?id=${storageId}`,
							{
								timeout: REQUEST_TIMEOUT,
								headers: {
									'Authorization': `Bearer ${apiKey}`,
								},
								...getAxiosConfig(baseUrl),
							},
						);

						lastStatus = statusResponse.data.status;

						if (lastStatus === 'certified' || lastStatus === 'COMPLETED') {
							// Success! Certification complete
							const waitTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
							responseData = {
								success: true,
								status: 'certified',
								storage_id: storageId,
								...statusResponse.data,
								wait_time_seconds: waitTimeSeconds,
								attempts,
								message: `Certification completed after ${waitTimeSeconds} seconds (${attempts} checks)`,
							};
							break;
						}

						// Wait before next check
						await new Promise((resolve) => setTimeout(resolve, pollingInterval * 1000));
					}

					// If we exit the loop without finding certified status, it's a timeout
					if (lastStatus !== 'certified' && lastStatus !== 'COMPLETED') {
						throw new NodeOperationError(
							this.getNode(),
							`Certification timeout after ${maxWaitTime} seconds. Last status: ${lastStatus}. User may not have completed payment yet.`,
						);
					}
				}

				// ============================================
				// DOWNLOAD OPERATION
				// ============================================
				else if (operation === 'download') {
					const storageId = this.getNodeParameter('storageId', i) as string;

					const response = await axios.get(
						`${baseUrl}${endpoint}/download/iv_route?id=${storageId}`,
						{
							timeout: REQUEST_TIMEOUT,
							headers: {
								'Authorization': `Bearer ${apiKey}`,
							},
							...getAxiosConfig(baseUrl),
						},
					);

					responseData = response.data;
				}

				// ============================================
				// GET PRICING OPERATION
				// ============================================
				else if (operation === 'getPricing') {
					// Get optional parameters
					const fileSize = this.getNodeParameter('fileSize', i, 0) as number;
					const originalSize = this.getNodeParameter('originalSize', i, 0) as number;
					
					// Build query params
					let queryParams = `type=${resourceType}`;
					if (fileSize > 0) {
						queryParams += `&fileSize=${fileSize}`;
					}
					if (originalSize > 0) {
						queryParams += `&originalSize=${originalSize}`;
					}
					
					const response = await axios.get(
						`${baseUrl}/api/pricing/service?${queryParams}`,
						{
							timeout: REQUEST_TIMEOUT,
							headers: {
								'Authorization': `Bearer ${apiKey}`,
							},
							...getAxiosConfig(baseUrl),
						},
					);

					responseData = response.data;
				}

				// ============================================
				// B2B CERTIFY FULL OPERATION
				// ============================================
				else if (operation === 'b2bCertifyFull') {
					const storageId = this.getNodeParameter('storageIdB2b', i) as string;
			
					// Get Solana private key from credential
					const solanaCredentials = await this.getCredentials('solanaApi', i);
					const userPrivateKey = solanaCredentials.privateKey as string;
			
					const nftName = this.getNodeParameter('nftName', i) as string;
					const nftSymbol = this.getNodeParameter('nftSymbol', i) as string;
					const nftDescription = this.getNodeParameter('nftDescription', i) as string;
					const ownerName = this.getNodeParameter('ownerName', i) as string;
					const externalUrl = this.getNodeParameter('externalUrl', i, '') as string;
					const twitterUrl = this.getNodeParameter('twitterUrl', i, '') as string;
					const discordUrl = this.getNodeParameter('discordUrl', i, '') as string;
					const instagramUrl = this.getNodeParameter('instagramUrl', i, '') as string;
					const telegramUrl = this.getNodeParameter('telegramUrl', i, '') as string;
					const mediumUrl = this.getNodeParameter('mediumUrl', i, '') as string;
					const wikiUrl = this.getNodeParameter('wikiUrl', i, '') as string;
					const youtubeUrl = this.getNodeParameter('youtubeUrl', i, '') as string;
					const collectionMintAddress = this.getNodeParameter('collectionMintAddress', i, '') as string;
					const affiliateCode = this.getNodeParameter('affiliateCode', i, '') as string;

					const requestBody = {
						storage_id: storageId,
						user_private_key: userPrivateKey,
						cert_data: {
							name: nftName,
							cert_symbol: nftSymbol,
							cert_description: nftDescription,
							cert_prop: ownerName,
							external_url: externalUrl,
							twitter_url: twitterUrl,
							discord_url: discordUrl,
							instagram_url: instagramUrl,
							telegram_url: telegramUrl,
							medium_url: mediumUrl,
							wiki_url: wikiUrl,
							youtube_url: youtubeUrl,
						},
						collection_mint_address: collectionMintAddress,
						affiliate_code: affiliateCode,
					};

					const response = await axios.post(
						`${baseUrl}${endpoint}/b2b-certify-full`,
						requestBody,
						{
							timeout: 120000, // 2 minutes timeout
							headers: {
								'Authorization': `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
							...getAxiosConfig(baseUrl),
						},
					);

					responseData = response.data;
				}

				// ============================================
				// LIST NFTs OPERATION
				// ============================================
				else if (operation === 'listNfts') {
					let walletAddress = this.getNodeParameter('walletAddress', i, '') as string;
					const filterName = this.getNodeParameter('filterName', i, '') as string;
					const limit = this.getNodeParameter('limit', i, 50) as number;

					// Get Solana credentials for wallet address and RPC URL
					const solanaCredentials = await this.getCredentials('solanaApi', i);
					
					// If no wallet address provided, use Solana credential public key
					if (!walletAddress) {
						walletAddress = solanaCredentials.publicKey as string;
					}

					// Get RPC URL from credential
					let rpcUrl: string;
					if (solanaCredentials.rpcType === 'custom') {
						rpcUrl = solanaCredentials.customRpcUrl as string;
					} else {
						const network = solanaCredentials.network as string;
						if (network === 'mainnet-beta') {
							rpcUrl = 'https://api.mainnet-beta.solana.com';
						} else if (network === 'devnet') {
							rpcUrl = 'https://api.devnet.solana.com';
						} else {
							rpcUrl = 'https://api.testnet.solana.com';
						}
					}

					// Get assets owned by wallet using Helius DAS API
					const response = await axios.post(
						rpcUrl,
						{
							jsonrpc: '2.0',
							id: 'n8n-digicryptostore',
							method: 'getAssetsByOwner',
							params: {
								ownerAddress: walletAddress,
								page: 1,
								limit: limit,
								displayOptions: {
									showFungible: false,
									showNativeBalance: false,
								},
							},
						},
						{
							timeout: REQUEST_TIMEOUT,
							headers: {
								'Content-Type': 'application/json',
							},
						},
					);

					let nfts = response.data.result?.items || [];

					// Filter by name if provided
					if (filterName) {
						const filterLower = filterName.toLowerCase();
						nfts = nfts.filter((nft: any) => {
							const name = nft.content?.metadata?.name || '';
							return name.toLowerCase().includes(filterLower);
						});
					}

					// Format NFTs for output
					const formattedNfts = nfts.map((nft: any) => ({
						mint_address: nft.id,
						name: nft.content?.metadata?.name || 'Unknown',
						symbol: nft.content?.metadata?.symbol || '',
						description: nft.content?.metadata?.description || '',
						image: nft.content?.links?.image || nft.content?.files?.[0]?.uri || '',
						external_url: nft.content?.metadata?.external_url || '',
						collection: nft.grouping?.find((g: any) => g.group_key === 'collection')?.group_value || null,
						attributes: nft.content?.metadata?.attributes || [],
						owner: nft.ownership?.owner || walletAddress,
						created_at: nft.content?.metadata?.created_at || null,
					}));

					responseData = {
						wallet_address: walletAddress,
						total_nfts: formattedNfts.length,
						filter_applied: filterName ? filterName : null,
						nfts: formattedNfts,
						// Highlight the last minted NFT (most recent created_at)
						last_minted: formattedNfts.length > 0
							? formattedNfts.reduce((latest: any, current: any) => {
								const latestTime = latest.created_at ? new Date(latest.created_at).getTime() : 0;
								const currentTime = current.created_at ? new Date(current.created_at).getTime() : 0;
								return currentTime > latestTime ? current : latest;
							})
							: null,
					};
				}

				// Unknown operation
				else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
					);
				}

				// Return the response data
				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});

			} catch (error: any) {
				// Handle errors gracefully
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: 'Request failed',
							status_code: error.response?.status,
							// SECURITY: Do not expose full response data (may contain sensitive info)
							message: error.response?.data?.error || error.message || 'Unknown error',
						},
						pairedItem: { item: i },
					});
					continue;
				}

				throw new NodeOperationError(
					this.getNode(),
					`PhotoCertif API error: ${error.message}`,
					{ itemIndex: i },
				);
			}
		}

		return [returnData];
	}
}
