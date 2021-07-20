//
//  P24ProtocolHandler.h
//  react-native-przelewy24-payment
//
//  Created by Arkadiusz Macudziński on 29.08.2016.
//  Modified by Konstantin Koulechov on Feb 2019 and later.
//

#import <React/RCTBridgeModule.h>
#import "P24.h"
#import "Przelewy24Payment.h"

@interface P24ProtocolHandler : NSObject<P24TransferDelegate>

@property (strong) RCTResponseSenderBlock rctCallback;

@end
