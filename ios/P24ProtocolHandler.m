//
//  P24ProtocolHandler.m
//  react-native-przelewy24-payment
//
//  Created by Arkadiusz Macudziński on 29.08.2016.
//  Modified by Konstantin Koulechov on Feb 2019.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "P24ProtocolHandler.h"

@implementation P24ProtocolHandler

-(void)p24TransferOnCanceled {
  _rctCallback(@[@"", @"isCanceled", [NSNull null]]);
  [Przelewy24Payment paymentClosed];
}

- (void)p24TransferOnSuccess {
  _rctCallback(@[@"isSuccess", [NSNull null], [NSNull null]]);
  [Przelewy24Payment paymentClosed];
}

- (void)p24TransferOnError:(NSString *)errorCode {
  _rctCallback(@[[NSNull null], [NSNull null], errorCode ]);
  [Przelewy24Payment paymentClosed];
}


@end
