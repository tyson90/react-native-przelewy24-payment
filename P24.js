import React from 'react';
import { NativeModules, Platform, Alert } from 'react-native';

const { RNPrzelewy24Payment: Przelewy24Payment } = NativeModules;

export class P24Payment {
	constructor({ merchant_id, crc, sandbox_crc, ssl_pinning, is_sandbox } = {}) {
		this.config = {
			merchant_id: `${merchant_id}`,
			crc: `${crc}`,
			sandbox_crc: `${sandbox_crc}`,
			ssl_pinning: !!ssl_pinning,
			is_sandbox: !!is_sandbox,
		}

		try {
			Przelewy24Payment.setCertificatePinningEnabled(this.config.ssl_pinning);

			this.configure(Platform.OS);
		} catch (e) {
			console.warn(e.toString());
			console.log({ NativeModules });
		}

		if (process?.env?.NODE_ENV && process?.env?.NODE_ENV !== 'production') {
			Alert.alert('Warning', 'The library contains anti-debug traps, so when using the library methods make sure the „Debug Executable” option is off.');
		}

		if (!merchant_id || !crc || (is_sandbox && !sandbox_crc)) {
			Alert.alert('Warning', 'Missing required P24Payment.constructor parameters.');
		}
	}

	configure(platform) {
		this.functions = {};

		this.functions.doRequestComplete = (success, cancel, error, callbacks) => {
			const info = { success, cancel, error };

			if (success) {
				console.log('Transfer success');
				this.finishWithStatus('success', info, callbacks);
			} else if (cancel) {
				console.log('Transfer canceled');
				this.finishWithStatus('cancel', info, callbacks);
			} else {
				console.log(`Transfer error. Code: ${error}`);
				this.finishWithStatus('error', info, callbacks);
			}
		}

		switch (platform) {
			/********************* Android platform *********************/

			case 'android':
				this.functions.doTrnRequest = async (token, callbacks) => {
					var trnRequestParams = {
						token,
						isSandbox: this.config.is_sandbox,
					}

					var {
						isSuccess,
						isCanceled,
						errorCode,
					} = await Przelewy24Payment.startTrnRequest(trnRequestParams);

					this.functions.doRequestComplete(isSuccess, isCanceled, errorCode, callbacks);
				}

				this.functions.doTrnDirect = async (params, callbacks) => {
					var trnDirectParams = {
						transactionParams: this.buildTransactionParams(params),
						isSandbox: this.config.is_sandbox,
					}

					var {
						isSuccess,
						isCanceled,
						errorCode,
					} = await Przelewy24Payment.startTrnDirect(trnDirectParams);

					this.functions.doRequestComplete(isSuccess, isCanceled, errorCode, callbacks);
				}

				this.functions.doExpress = async (url, callbacks) => {
					var expressParams = { url };

					var {
						isSuccess,
						isCanceled,
						errorCode,
					} = await Przelewy24Payment.startExpress(expressParams);

					this.functions.doRequestComplete(isSuccess, isCanceled, errorCode, callbacks);
				}

				this.functions.doPassage = async (params, items, callbacks) => {
					var trnDirectParams = {
						transactionParams: this.buildPassageParams(params, items),
						isSandbox: this.config.is_sandbox,
					}

					var {
						isSuccess,
						isCanceled,
						errorCode,
					} = await Przelewy24Payment.startTrnDirect(trnDirectParams);

					this.functions.doRequestComplete(isSuccess, isCanceled, errorCode, callbacks);
				}

				break;


			/********************* iOS platform *********************/

			case 'ios':
				this.functions.doTrnRequest = async (token, callbacks) => {
					var trnRequestParams = {
						token,
						isSandbox: this.config.is_sandbox,
					}

					Przelewy24Payment.startTrnRequestWithParams(trnRequestParams, (success, cancel, error) => {
						this.functions.doRequestComplete(success, cancel, error, callbacks);
					})
				}

				this.functions.doTrnDirect = async (params, callbacks) => {
					var trnDirectParams = {
						transactionParams: this.buildTransactionParams(params),
						isSandbox: this.config.is_sandbox,
					}

					Przelewy24Payment.startTrnDirectWithParams(trnDirectParams, (success, cancel, error) => {
						this.functions.doRequestComplete(success, cancel, error, callbacks);
					})
				}

				this.functions.doExpress = async (url, callbacks) => {
					var expressParams = { url };

					Przelewy24Payment.startExpressWithParams(expressParams, (success, cancel, error) => {
						this.functions.doRequestComplete(success, cancel, error, callbacks);
					})
				}

				this.functions.doPassage = async (params, items, callbacks) => {
					var trnDirectParams = {
						transactionParams: this.buildPassageParams(params, items),
						isSandbox: this.config.is_sandbox,
					}

					Przelewy24Payment.startTrnDirectWithParams(trnDirectParams, (success, cancel, error) => {
						this.functions.doRequestComplete(success, cancel, error, callbacks);
					})
				}

				break;

			default:
				console.error(`Platform '${platform}' is not supported. Supported platforms are: 'ios', 'android'`);
				break;
		}
	}

	getCrc() {
		return this.config.is_sandbox ? this.config.sandbox_crc : this.config.crc;
	}

	buildTransactionParams(params = {}) {
		// TODO: Validate params

		return {
			merchantId: this.config.merchant_id,
			crc: this.getCrc(),
			sessionId: params.session_id,
			amount: params.amount,
			currency: params.currency || params.currency_id,
			description: params.description,
			email: params.email,
			country: params.country || params.country_id,
			client: params.client || [params.first_name, params.last_name].filter(e => e).join(''),
			address: params.address,
			zip: params.zip,
			city: params.city,
			phone: params.phone,
			language: params.language || params.lang,
		}
	}

	buildPassageParams(params, items = []) {
		// TODO: Validate items

		return {
			...this.buildTransactionParams(params),
			passageCart: items,
		}
	}

	finishWithStatus(status, info = {}, callbacks = {}) {
		const callback = callbacks[status];

		if (typeof callback == 'function') {
			callback(info[status]);
		}
	}

	// Public methods

	startTrnRequest(token, callbacks) {
		this.functions.doTrnRequest(token, callbacks);
	}

	startTrnDirect(params, callbacks) {
		this.functions.doTrnDirect(params, callbacks);
	}

	startTrnExpress(url, callbacks) {
		this.functions.doExpress(url, callbacks);
	}

	startTrnPassage(params, items, callbacks) {
		this.functions.doPassage(params, items, callbacks);
	}
}
