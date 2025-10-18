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
		subtitle: '={{$parameter["operation"] === "listNfts" ? "List NFTs" : ($parameter["resourceType"] === "image" ? "Photo (Pinata)" : $parameter["resourceType"] === "image2" ? "Art (Arweave)" : "Document (Arweave)")}}',
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
						name: 'Certify',
						value: 'b2bCertifyFull',
						description: 'Complete certification (Upload + AI + Storage + NFT minting)',
						action: 'Certify',
					},
					{
						name: 'List NFTs',
						value: 'listNfts',
						description: 'List NFTs owned by wallet address',
						action: 'List NFTs',
					},
				],
				default: 'b2bCertifyFull',
			},
			// ============================================
			// B2B CERTIFY FULL PARAMETERS
			// ============================================
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: '',
				placeholder: 'https://example.com/image.jpg',
				description: 'Public URL of the file to certify',
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
				description: 'NFT symbol (max 4 uppercase letters A-Z, auto-converted)',
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
				description: 'Owner name (max 20 alphanumeric characters + spaces)',
				required: true,
			},
			{
				displayName: 'Enable C2PA',
				name: 'enableC2pa',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['b2bCertifyFull'],
					},
				},
				default: false,
				description: 'Enable C2PA metadata embedding for enhanced authenticity',
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
				description: 'External website URL (optional, fallback available)',
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
				description: 'Twitter/X profile URL (optional, fallback available)',
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
				description: 'Discord server URL (optional, fallback available)',
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
				description: 'Instagram profile URL (optional, fallback available)',
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
				placeholder: 'https://t.me/channel',
				description: 'Telegram channel URL (optional, fallback available)',
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
				description: 'Medium blog URL (optional, fallback available)',
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
				description: 'Wiki documentation URL (optional, fallback available)',
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
				description: 'YouTube channel URL (optional, fallback available)',
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
					// Build endpoint based on resourceType
					endpoint = `/api/storage/${resourceType}`;
				}

				// ============================================
				// B2B CERTIFY FULL OPERATION
				// ============================================
				if (operation === 'b2bCertifyFull') {
					const fileUrl = this.getNodeParameter('fileUrl', i) as string;
			
					// Get Solana private key from credential
					const solanaCredentials = await this.getCredentials('solanaApi', i);
					const userPrivateKey = solanaCredentials.privateKey as string;
					
					// Get PhotoCertif credentials for Pinata API keys
					const credentials = await this.getCredentials('photoCertifApi', i);
					const pinataApiKey = (credentials.pinataApiKey as string) || '';
					const pinataSecretKey = (credentials.pinataSecretKey as string) || '';
			
					const nftName = this.getNodeParameter('nftName', i) as string;
					let nftSymbol = this.getNodeParameter('nftSymbol', i) as string;
					const nftDescription = this.getNodeParameter('nftDescription', i) as string;
					let ownerName = this.getNodeParameter('ownerName', i) as string;
					
					// Validation: Symbol must be uppercase, max 4 chars, A-Z only
					nftSymbol = nftSymbol.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
					if (!nftSymbol || nftSymbol.length === 0) {
						throw new NodeOperationError(this.getNode(), 'Symbol must contain at least 1 uppercase letter (A-Z)');
					}
					
					// Validation: Owner name max 20 chars, alphanumeric + spaces only
					ownerName = ownerName.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 20);
					if (!ownerName || ownerName.trim().length === 0) {
						throw new NodeOperationError(this.getNode(), 'Owner name is required (max 20 alphanumeric characters)');
					}
					
					const enableC2pa = this.getNodeParameter('enableC2pa', i, false) as boolean;
					const externalUrl = this.getNodeParameter('externalUrl', i, '') as string;
					const twitterUrl = this.getNodeParameter('twitterUrl', i, '') as string;
					const discordUrl = this.getNodeParameter('discordUrl', i, '') as string;
					const instagramUrl = this.getNodeParameter('instagramUrl', i, '') as string;
					const telegramUrl = this.getNodeParameter('telegramUrl', i, '') as string;
					const mediumUrl = this.getNodeParameter('mediumUrl', i, '') as string;
					const wikiUrl = this.getNodeParameter('wikiUrl', i, '') as string;
					const youtubeUrl = this.getNodeParameter('youtubeUrl', i, '') as string;
					const collectionMintAddress = this.getNodeParameter('collectionMintAddress', i, '') as string;

					const requestBody = {
						file_url: fileUrl,
						title: nftName,
						description: nftDescription,
						user_private_key: userPrivateKey,
						collection_mint_address: collectionMintAddress || null,
						cert_photoname: nftName,
						cert_symbol: nftSymbol,
						cert_description: nftDescription,
						cert_prop: ownerName,
						cert_c2pa: enableC2pa,
						pinata_api: pinataApiKey,
						pinata_api_secret: pinataSecretKey,
						external_url: externalUrl,
						twitter_url: twitterUrl,
						discord_url: discordUrl,
						instagram_url: instagramUrl,
						telegram_url: telegramUrl,
						medium_url: mediumUrl,
						wiki_url: wikiUrl,
						youtube_url: youtubeUrl,
					};

					const response = await axios.post(
						`${baseUrl}${endpoint}/b2b-certify-full`,
						requestBody,
						{
							timeout: 360000, // 6 minutes timeout (upload + AI + C2PA + Pinata + mint)
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
