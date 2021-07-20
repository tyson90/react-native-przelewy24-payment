# react-native-przelewy24-payment

Based on [official example](https://github.com/przelewy24/p24-mobile-lib-react-native-example).

## Getting started

### Installation

`$ npm i --save react-native-przelewy24-payment`

or

`$ yarn add react-native-przelewy24-payment`

### Linking (for React Native <= 0.59 only, React Native >= 0.60 skip this as auto-linking should work)

`$ react-native link react-native-przelewy24-payment`

### Extra stepps for iOS

#### 1. Adding P24 library files

Library files (`libP24.a` (or `libP24-bitcode.a` for projects with bitcode enabled) and `P24.h`) should be added to the project. In order to add them, perform the following:

- download files from [official repo](https://github.com/przelewy24/p24-mobile-lib-ios) and save to disk (outside of React Native project)
- in Xcode select „File → Add Files To”
- select files from downloaded folder
- select option „Copy items into destination folder (if needed)”
- select option „Create groups for any added folders”
- in the field „Add to targets” select all the elements to which a library can be added

Make sure that the Target settings have been updated properly. File `libP24.a` (or `libP24-bitcode.a`) should be added automatically in the field „Link Binary With Libraries”, bookmark „Build Phases”. In order to check that, perform the following:

- select project in “Project Navigator”
- select the Target in which the library is to be used
- select bookmark “Build Phases”
- select section “Link Binary With Libraries”
- if file `libP24.a` (or `libP24-bitcode.a`) is not on the list, drag it from the “Project Navigator” window
- repeat the steps above for all the Targets in which a library is to be used

#### 2. CocoaPods

Finally, install CocoaPods by running command:

`$ cd ios && pod install && cd ../`

### Extra steps for Android

```javascript
// TODO: Extra steps for Android if needed
```

## Usage

```javascript
import Przelewy24Payment from 'react-native-przelewy24-payment';

// Pre-defined constants you may need
const P24_CHANNEL_CARDS = 1;
const P24_CHANNEL_TRANSFERS = 2;
const P24_CHANNEL_TRADITIONAL_TRANSFERS = 4;
const P24_CHANNEL_NA = 8;
const P24_CHANNEL_24_7 = 16;
const P24_CHANNEL_PREPAYMENT = 32;

// Define configuration
const config = {
	merchant_id: '[YOUR P24 MERCHANT ID]',
	crc: '[YOUR P24 CRC]',
	ssl_pinning: false,
	is_sandbox: true,
	sandbox_crc: '[YOUR P24 CRC FOR SANDBOX]', // required if you want to test in sandbox mode
}

// Get instance
const p24 = new Przelewy24Payment(config);

// Define your callbacks for successfull and cancelled transactions and if error occurs
const p24_callbacks = {
	success: (msg) => console.info(msg),
	cancel: (msg) => console.info(msg),
	error: (error) => console.warn(error),
}
```

### 1. Make direct transaction call (trnDirect)

```javascript
// Define request parameters (in real world you will get it ex. from user order)
const trn_params = {
	// required parameters
	sessionId: '[SOME UNIQUE SESSION ID AS STRING]',
	amount: 2500, // amount 2500 = $25.00
	currency: 'USD',
	description: 'Order number XYZ',
	email: 'test@test.com',
	country: 'US',
	// some optional client data
	client: 'John Smith',
	address: 'Street with house/flat number',
	zip: '00-000',
	city: 'New York',
	phone: '+1 000 111 2222',
	language: 'en',
	// some optional other parameters
	urlStatus: 'https://yourdomain.com/p24_status_return.php',
	timeLimit: 15, // time in minutes
}

// If you need disable all methods except cards
let cardsOnly = true;

if (cardsOnly) {
	trn_data.channel = P24_CHANNEL_CARDS;
	// Or you can set it to another one
}

// Make transaction call
p24.startTrnDirect(trn_params, p24_callbacks);
```

You can read full documentation for request parameters [here](https://www.przelewy24.pl/storage/app/media/pobierz/Instalacja/przelewy24_dokumentacja_3.2.pdf).

### 2. trnRequest transaction call

```javascript
// TODO: test and write better documentation
p24.startTrnRequest(token, p24_callbacks);
```

### 3. Express transaction call

```javascript
// TODO: test and write better documentation
p24.startTrnExpress(url, p24_callbacks);
```

### 4. Passage 2.0 transaction call

```javascript
// TODO: test and write better documentation

// trn_params are the same as in startTrnDirect

// Items: array of objects
const items = [];

items.push({
	name: 'Item #1',
	description: 'Description #1',
	number: 1,
	quantity: 3,
	price: 1000,
	targetAmount: 3000, // item.price * item.quantity
	targetPosId: '[TARGET POS ID]',
});

// items.push(/* second item */);

p24.startTrnPassage(trn_params, items, p24_callbacks);
```

### 6. Apple Pay

```javascript
// TODO: Paste from P24 doc and own JS code
```

### Quick Example Screen
```javascript
import React from 'react';
import Example from 'react-native-przelewy24-payment/Example';

export default class P24ExampleComponent extends React.Component
{
	render() {
		const config = {
			merchantId: '[YOUR P24 MERCHANT ID]',
			crc: '[YOUR P24 CRC]',
			sslPinningEnabled: false,
			isSandbox: true,
			sandboxCrc: '[YOUR P24 CRC FOR SANDBOX]', // required if you want to test in sandbox mode
		}

		return (
			<Example
				merchantId={config.merchantId}
				crc={config.crc}
				sslPinning={config.sslPinningEnabled}
				isSandbox={config.isSandbox}
				sandboxCrc={config.sandboxCrc}
			/>
		)
	}
}
```

# TODO

* [ ] Android implementation
* [ ] Android testting
* [ ] iOS: Transfer trnRequest tests
* [ ] iOS: Transfer express tests
* [ ] iOS: Transfer passage tests
* [ ] iOS: Change UIModalPresentationStyle to UIModalPresentationFullScreen
* [ ] Update README
