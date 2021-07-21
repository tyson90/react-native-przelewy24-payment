import React from 'react';
import { NativeModules, Platform, Alert } from 'react-native';

const { RNPrzelewy24Payment: Przelewy24Payment } = NativeModules;

class P24Payment {
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

		const checkProps = () => {
			if (!merchant_id || !crc || (is_sandbox && !sandbox_crc)) {
				console.warn('Warning', 'Missing required P24Payment.constructor parameters: '+ ['merchant_id', 'crc', is_sandbox && 'sandbox_crc (when is_sandbox=true)'].filter(e => e).join(', '));
			}
		}

		if (process?.env?.NODE_ENV && process?.env?.NODE_ENV !== 'production') {
			console.warn('Warning', 'The library contains anti-debug traps, so when using the library methods make sure the „Debug Executable” option is off.', checkProps);
		} else {
			checkProps();
		}
	}

	configure(platform) {
		this.functions = {};

		this.functions.doRequestComplete = async (success, cancel, error, callbacks) => {
			const info = { success, cancel, error };

			if (success) {
				console.log('Transfer success');
				await require('utils/Helper').fakeAwait(2500);
				this.finishWithStatus('success', info, callbacks);
			} else if (cancel) {
				console.log('Transfer canceled');
				await require('utils/Helper').fakeAwait(2500);
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

				this.functions.doApplePay = async (params, callbacks, onToken = this.noFun) => {
					const applepay_is_avail = await Przelewy24Payment.canMakeApplePayPayments();

					if (!applepay_is_avail) {
						console.error(`Apple Pay is not available for this device. You should check it by calling Przelewy24Payment.canMakeApplePayPayments() before oferring Apple Pay`);
						return false;
					}

					var applePayParams = {
						appleMerchantId: params.appleMerchantId,
						amount: +params.amount,
						currency: params.currency,
						description: params.description,
						isSandbox: this.config.is_sandbox,
						items: params.items,

						// Optional parameters
						fullScreen: Boolean(params.fullScreen),
					}

					Przelewy24Payment.startApplePay(applePayParams, (success, cancel, error) => {
						this.functions.doRequestComplete(success, cancel, error, callbacks);
					}, onToken)
				}

				break;

			default:
				console.error(`Platform '${platform}' is not supported. Supported platforms are: 'ios', 'android'`);
				break;
		}
	}

	noFun = (...args) => {
		console.log('Called P24.noFun with args', { args });
	}

	getCrc() {
		return this.config.is_sandbox ? this.config.sandbox_crc : this.config.crc;
	}

	buildTransactionParams(params = {}) {
		// TODO: Validate params

		const trnParams = {
			merchantId: this.config.merchant_id,
			crc: this.getCrc(),
			sessionId: params.sessionId || params.session_id,
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

		// Optional parameters

		if (params.method) {
			trnParams.method = params.method;
		}

		if (params.timeLimit) {
			trnParams.timeLimit = params.timeLimit;
		}

		if (params.channel) {
			trnParams.channel = params.channel;
		}

		if (params.urlStatus) {
			trnParams.urlStatus = params.urlStatus;
		}

		if (params.transferLabel) {
			trnParams.transferLabel = params.transferLabel;
		}

		if (params.shipping) {
			trnParams.shipping = params.shipping;
		}


		return trnParams;
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
			console.log({ status, info , cur_tm: new Date().getTime()/1000 });
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

	startApplePay(params, callbacks, onToken) {
		this.functions.doApplePay(params, callbacks, onToken);
	}

	static async canMakeApplePayPayments() {
		return await Przelewy24Payment.canMakeApplePayPayments();
	}

	static async finishApplePay(p24_token) {
		return await Przelewy24Payment.finishApplePay(p24_token);
	}

	static clear() {
		return Przelewy24Payment.clear();
	}

	static dismissApplePay(cb) {
		const log = (...args) => console.log('dismissApplePay', ...args);
		return Przelewy24Payment.dismissApplePay(cb || log);
	}
}

export {
	Przelewy24Payment,
	P24Payment,
}
