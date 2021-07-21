/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';

import {
	StyleSheet,
	Text,
	TextInput,
	View,
	KeyboardAvoidingView,
	Button,
	Switch,
	NativeModules,
	Platform,
	Dimensions,
	Alert,
} from 'react-native';

import { P24Payment, Przelewy24Payment } from './P24';

function getTestTransactionParams(amount = 3) {
	return {
		sessionId: generateSessionId(),
		amount: amount,
		currency: 'PLN',
		description: 'Test payment description',
		email: 'test@test.com',
		country: 'PL',
		client: 'John Smith',
		address: 'Test street',
		zip: '20-001',
		city: 'Lublin',
		phone: '1246423234',
		language: 'pl',
	}
}

function getTestPassageItems(itemsCount = 10) {
	let amount = 0;
	let items = [];

	for (let i = 0; i < itemsCount; i++) {
		const price = 2 * (100 + i);
		const item = {
			name: 'Product name ' + i,
			description: 'Product description ' + i,
			number: i,
			quantity: 2,
			price: price / 2,
			targetAmount: price,
			// targetPosId: i / 2 == 1 ? 51986 : 51987,
		}

		amount += item['price'];
		items.push(item);
	}

	return { amount, items };
}

function getTestApplePayParams(appleMerchantId, amount = 3) {
	if (typeof appleMerchantId === 'number') {
		amount = appleMerchantId;
		appleMerchantId = void 0;
	}

	return {
		appleMerchantId: appleMerchantId || 'merchant.Przelewy24.sandbox',
		amount: amount,
		currency: 'PLN',
		description: 'Test payment with Apple Pay',
	}
}

function getTestApplePayParamsWithItems(appleMerchantId, amount) {
	const params = getTestApplePayParams(appleMerchantId, amount);

	params.items = [
		{ amount: params.amount + 1, itemDescription: 'Item 1st' },
		{ amount: params.amount + 3, itemDescription: 'Item 2nd' },
	];

	return params;
}

function generateSessionId() {
	return 'xxxxxxxxxxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	})
}

export class SandboxSwitch extends React.PureComponent {
	render() {
		return (
			<View style={styles.buttonContainer}>
				<Text style={styles.instructions}>
					{'Sandbox'}
				</Text>

				<Switch
					title={'Sandbox'}
					value={this.props.value}
					onValueChange={this.props.onChange}
				/>

				<Text style={styles.instructions}>
					{'\n'}
				</Text>
			</View>
		)
	}
}

export class TrnRequestButton extends React.PureComponent {
	render() {
		return (
			<View style={styles.buttonContainer}>
				<Button
					title={'Transfer trnRequest'}
					styleDisabled={{ color: 'red' }}
					onPress={this.props.onPress}>
				</Button>
			</View>
		)
	}
}

export class TrnDirectButton extends React.PureComponent {
	render() {
		return (
			<View style={styles.buttonContainer}>
				<Button
					title={'Transfer trnDirect'}
					styleDisabled={{ color: 'red' }}
					onPress={this.props.onPress}>
				</Button>
			</View>
		)
	}
}

export class ExpressButton extends React.PureComponent {
	render() {
		return (
			<View style={styles.buttonContainer}>
				<Button
					title={'Transfer express'}
					styleDisabled={{ color: 'red' }}
					onPress={this.props.onPress}>
				</Button>
			</View>
		)
	}
}

export class PassageButton extends React.PureComponent {
	render() {
		return (
			<View style={styles.buttonContainer}>
				<Button
					title={'Transfer passage'}
					styleDisabled={{ color: 'red' }}
					onPress={this.props.onPress}>
				</Button>
			</View>
		)
	}
}

export class ApplePayButton extends React.PureComponent {
	render() {
		return (
			<View style={styles.buttonContainer}>
				<Button
					title={this.props.title || 'Apple Pay'}
					styleDisabled={{ color: 'red' }}
					onPress={this.props.onPress}>
				</Button>
			</View>
		)
	}
}

export class TokenInput extends React.PureComponent {
	render() {
		return (
			<View>
				<Text style={styles.instructions}>
					{'\n'}
					{'Transaction token/url:'}
				</Text>

				<TextInput
					style={styles.input}
					value={this.props.value}
					onChangeText={this.props.onChange}
				/>
			</View>
		)
	}
}

export default class P24Example extends React.PureComponent {
	constructor(...args) {
		super(...args);

		this.state = {
			is_sandbox: this.props.isSandbox,
			url_or_token: '',
		}

		const checkProps = () => {
			if (!this.props.merchantId || !this.props.crc || (this.props.isSandbox && !this.props.sandboxCrc)) {
				Alert.alert('Warning', 'Missing required props: '+ ['merchantId', 'crc', this.props.isSandbox && 'sandboxCrc (when isSandbox={true})'].filter(e => e).join(', '));
			}
		}

		if (process?.env?.NODE_ENV && process?.env?.NODE_ENV !== 'production') {
			Alert.alert('Warning', 'The library contains anti-debug traps, so when using the library methods make sure the „Debug Executable” option is off.', checkProps);
		} else {
			checkProps();
		}
	}

	constructP24() {
		const p24 = new P24Payment({
			merchant_id: this.props.merchantId,
			crc: this.props.crc,
			sandbox_crc: this.props.sandboxCrc,
			is_sandbox: this.state.is_sandbox,
			ssl_pinning: this.props.sslPinning,
		})

		console.log({ p24 }, this.props);

		return p24;
	}

	getCallbacks() {
		return {
			success: this.props.onSuccess || (msg => console.log(`Success: ${msg}`)),
			cancel: this.props.onCancel || (msg => console.log(`Cancel: ${msg}`)),
			error: this.props.onError || (msg => console.log(`Error: ${msg}`)),
		}
	}

	startTrnRequest = () => {
		this.constructP24().startTrnRequest(this.state.url_or_token, this.getCallbacks());
	}

	startTrnDirect = () => {
		this.constructP24().startTrnDirect(getTestTransactionParams(), this.getCallbacks());
	}

	startTrnExpress = () => {
		this.constructP24().startTrnExpress(this.state.url_or_token, this.getCallbacks());
	}

	startTrnPassage = () => {
		const { amount, items } = getTestPassageItems(4);
		const params = getTestTransactionParams(amount);

		this.constructP24().startTrnPassage(params, items, this.getCallbacks());
	}

	startApplePay = async () => {
		const p24 = this.constructP24();
		const { appleMerchantId } = this.props;

		try {
			P24Payment.canMakeApplePayPayments().then((can) => console.log({ can })).catch(e => console.warn(e));
			console.log('Can make payments?', await P24Payment.canMakeApplePayPayments());
		} catch (e) {
			console.error(e);
		}

		if (!appleMerchantId) {
			return Alert.alert('Error', 'You should provide `appleMerchantId` prop for testing Apple Pay');
		}

		p24.startApplePay(getTestApplePayParams(appleMerchantId), this.getCallbacks(), this.onApplePayToken);
	}

	startApplePayWithItems = () => {
		const { appleMerchantId } = this.props;

		if (!appleMerchantId) {
			return Alert.alert('Error', 'You should provide `appleMerchantId` prop for testing Apple Pay');
		}

		this.constructP24().startApplePay(getTestApplePayParamsWithItems(appleMerchantId), this.getCallbacks());
	}

	onApplePayToken = async (token, ...args) => {
		const { onApplePayToken } = this.props;
		console.log(typeof onApplePayToken, { token, args });

		if (typeof onApplePayToken !== 'function') {
			Alert.alert('Error', 'You should provide `onApplePayToken` prop (async func, which should return valid P24_TRANSACTION_TOKEN) for finish Apple Pay');
			P24Payment.clear();
			return;
		}

		const p24_token = await onApplePayToken(token);
		await P24Payment.finishApplePay(p24_token);
	}

	render() {
		return (
			<KeyboardAvoidingView style={styles.container} behavior={'position'} enabled>
				<Text style={styles.welcome}>
					{'Przelewy24 (PayPro S.A.) payments implementation for React Native'}
				</Text>
				<Text style={styles.instructions}>
					{'To get started, press any button below'}
				</Text>

				<Text>
					{'\n'}
					{'\n'}
					{'\n'}
					{'\n'}
				</Text>

				<SandboxSwitch
					value={this.state.is_sandbox}
					onChange={(is_sandbox) => this.setState({ is_sandbox })}
				/>

				<TrnRequestButton onPress={this.startTrnRequest} />
				<TrnDirectButton onPress={this.startTrnDirect} />
				<ExpressButton onPress={this.startTrnExpress} />
				<PassageButton onPress={this.startTrnPassage} />
				<ApplePayButton onPress={this.startApplePay} />
				<ApplePayButton
					onPress={this.startApplePayWithItems}
					title={'Apple Pay with items'}
				/>

				<TokenInput
					value={this.state.url_or_token}
					onChange={(url_or_token) => this.setState({ url_or_token })}
				/>
			</KeyboardAvoidingView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		marginBottom: 5,
	},
	input: {
		width: Dimensions.get('window').width * 0.8,
		height: 40,
		borderBottomWidth: 0.5,
		color: '#333333',
	},
	buttonContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
})
