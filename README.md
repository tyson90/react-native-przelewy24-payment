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

// TODO: What to do with the module?
Przelewy24Payment;
```

### Quick Example
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
* [ ] README
