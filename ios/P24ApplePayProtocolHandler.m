//
//  P24ApplePayProtocolHandler.m
//  react-native-przelewy24-payment
//
//  Created by Konstantin Koulechov on 16.07.2021.
//

#import "P24ApplePayProtocolHandler.h"

@implementation P24ApplePayProtocolHandler

P24ApplePayRegistrarProtocolHandler* apDelegate;

-(void) p24ApplePayOnCanceled {
  NSLog(@"Timestamp before _rctCallback (cancelled): %f", [[NSDate date] timeIntervalSince1970]);
  _rctCallback(@[@"", [NSString stringWithFormat:@"isCanceled with timestamp: %f", [[NSDate date] timeIntervalSince1970]], [NSNull null]]);
  NSLog(@"Timestamp after _rctCallback (cancelled): %f", [[NSDate date] timeIntervalSince1970]);
  [Przelewy24Payment applePayPaymentClosed];
}

- (void) p24ApplePayOnSuccess {
  NSLog(@"Timestamp before _rctCallback (success): %f", [[NSDate date] timeIntervalSince1970]);
  // _rctCallback(@[[NSString stringWithFormat:@"isSuccess with timestamp: %f", [[NSDate date] timeIntervalSince1970]], [NSNull null], [NSNull null]]);
  NSLog(@"DON'T call because of error: Invariant Violation: No callback found [...] - most likely the callback was already invoked.");
  NSLog(@"Timestamp after _rctCallback (success): %f", [[NSDate date] timeIntervalSince1970]);
  [Przelewy24Payment applePayPaymentClosed];
}

- (void) p24ApplePayOnError:(NSString *)errorCode {
  _rctCallback(@[[NSNull null], [NSNull null], errorCode ]);
  [Przelewy24Payment applePayPaymentClosed];
}

@end


@implementation P24ApplePayRegistrarProtocolHandler

- (void) onRegisterStart: (NSString*) applePayToken delegate: (id<P24ApplePayTransactionRegistrarDelegate>) delegate {
  NSLog(@"Timestamp before onRegisterStart: %f", [[NSDate date] timeIntervalSince1970]);
  NSLog(@"ApplePay onRegisterStart applePayToken = %@", applePayToken);

  apDelegate = delegate;

  dispatch_time_t delay = dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC * 0.1);

  dispatch_after(delay, dispatch_get_main_queue(), ^{
    NSLog(@"dispatch_after timeout (timestamp: %f)", [[NSDate date] timeIntervalSince1970]);
    self->_rctCallback2(@[applePayToken]);
  });
}

- (void) onRegisterCanceled {
  NSLog(@"Timestamp before onRegisterCanceled: %f", [[NSDate date] timeIntervalSince1970]);
  NSLog(@"ApplePay onRegisterCanceled");
}

- (void) onRegisterSuccess:(NSString *)token {
  NSLog(@"ApplePay onRegisterSuccess (original) token = %@", token);
  [apDelegate onRegisterSuccess:token];
}

@end
