//
//  Przelewy24Payment.h
//  react-native-przelewy24-payment
//
//  Created by Marek Latuszek on 26/09/2019.
//  Modified by Konstantin Koulechov on Feb 2019
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "P24.h"
#import "P24ProtocolHandler.h"

@interface Przelewy24Payment : NSObject <RCTBridgeModule>

+ (void) paymentClosed;

@end
