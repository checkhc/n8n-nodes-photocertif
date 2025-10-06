import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import axios from 'axios';
import FormData from 'form-data';

export class PhotoCertif implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PhotoCertif',
		name: 'photoCertif',
		icon: 'file:photocertif.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with PhotoCertif API for document certification on Solana blockchain',
		defaults: {
			name: 'PhotoCertif',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'photoCertifApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Upload Document',
						value: 'uploadDocument',
						description: 'Upload a document to PhotoCertif',
						action: 'Upload a document',
					},
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get certification status of a document',
						action: 'Get document status',
					},
					{
						name: 'Certify Document',
						value: 'certifyDocument',
						description: 'Start blockchain NFT certification',
						action: 'Certify a document',
					},
					{
						name: 'Download Document',
						value: 'downloadDocument',
						description: 'Download certified document',
						action: 'Download a document',
					},
				],
				default: 'uploadDocument',
			},

			// Upload Document
			{
				displayName: 'File',
				name: 'fileData',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['uploadDocument'],
					},
				},
				default: '',
				placeholder: 'Base64 encoded file or binary data',
				description: 'The file to upload (as base64 or use $binary reference)',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['uploadDocument'],
					},
				},
				default: '',
				placeholder: 'Contract 2025',
				description: 'Document title',
				required: true,
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['uploadDocument'],
					},
				},
				default: '',
				placeholder: 'Optional description',
				description: 'Document description (optional)',
			},

			// Get Status
			{
				displayName: 'Storage ID',
				name: 'storageId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getStatus', 'certifyDocument', 'downloadDocument'],
					},
				},
				default: '',
				placeholder: 'iv_xxxxxxxxxxxxx',
				description: 'The storage ID returned from upload',
				required: true,
			},

			// Certify Document
			{
				displayName: 'Additional Metadata',
				name: 'metadata',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['certifyDocument'],
					},
				},
				default: '{}',
				placeholder: '{"author": "John Doe", "version": "1.0"}',
				description: 'Additional metadata to include in NFT (JSON format)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const credentials = await this.getCredentials('photoCertifApi', i);

				const baseUrl = credentials.photoCertifUrl as string;
				const apiKey = credentials.apiKey as string;
				const walletPrivateKey = credentials.walletPrivateKey as string;

				let responseData: any;

				if (operation === 'uploadDocument') {
					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;
					const fileData = this.getNodeParameter('fileData', i, '') as string;

					const response = await axios.post(
						`${baseUrl}/api/storage/docs/upload/iv_route`,
						{
							file: fileData,
							title,
							description,
						},
						{
							headers: {
								'Authorization': `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
						},
					);

					responseData = response.data;
				} else if (operation === 'getStatus') {
					const storageId = this.getNodeParameter('storageId', i) as string;

					const response = await axios.get(
						`${baseUrl}/api/storage/docs/status/iv_route?id=${storageId}`,
						{
							headers: {
								'Authorization': `Bearer ${apiKey}`,
							},
						},
					);

					responseData = response.data;
				} else if (operation === 'certifyDocument') {
					const storageId = this.getNodeParameter('storageId', i) as string;
					const metadataStr = this.getNodeParameter('metadata', i, '{}') as string;
					
					let metadata = {};
					try {
						metadata = JSON.parse(metadataStr);
					} catch (e) {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON in metadata field');
					}

					const response = await axios.post(
						`${baseUrl}/api/storage/docs/certify/iv_route`,
						{
							id: storageId,
							metadata,
							walletPrivateKey, // Send private key securely via HTTPS
						},
						{
							headers: {
								'Authorization': `Bearer ${apiKey}`,
								'Content-Type': 'application/json',
							},
						},
					);

					responseData = response.data;
				} else if (operation === 'downloadDocument') {
					const storageId = this.getNodeParameter('storageId', i) as string;

					const response = await axios.get(
						`${baseUrl}/api/storage/docs/download/iv_route?id=${storageId}`,
						{
							headers: {
								'Authorization': `Bearer ${apiKey}`,
							},
						},
					);

					responseData = response.data;
				}

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
