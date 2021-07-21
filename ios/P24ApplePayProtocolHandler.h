//
//  P24ApplePayProtocolHandler.h
//  react-native-przelewy24-payment
//
//  Created by Konstantin Koulechov on 16.07.2021.
//

#import <React/RCTBridgeModule.h>
#import "P24.h"
#import "Przelewy24Payment.h"

@interface P24ApplePayProtocolHandler : NSObject<P24ApplePayDelegate>

@property (strong) RCTResponseSenderBlock rctCallback;

@end


@interface P24ApplePayRegistrarProtocolHandler : NSObject<P24ApplePayTransactionRegistrarDelegate>

- (void) onRegisterStart: (NSString*) token delegate: (id<P24ApplePayTransactionRegistrarDelegate>) delegate;
@property (strong) RCTResponseSenderBlock rctCallback;
@property (strong) RCTResponseSenderBlock rctCallback2;

@end
