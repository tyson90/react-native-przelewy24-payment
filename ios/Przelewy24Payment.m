//
//  Przelewy24Payment.m
//  react-native-przelewy24-payment
//
//  Created by Marek Latuszek on 26/09/2019.
//  Modified by Konstantin Koulechov on Feb 2019 and later.
//

#import "Przelewy24Payment.h"
#import <React/RCTLog.h>
#import <PassKit/PassKit.h>

@implementation Przelewy24Payment

P24ProtocolHandler* p24Handler;
P24ApplePayProtocolHandler* p24ApplePayHandler;
P24ApplePayRegistrarProtocolHandler* p24ApplePayRegisterHandler;


RCT_EXPORT_MODULE(RNPrzelewy24Payment);

RCT_EXPORT_METHOD(setCertificatePinningEnabled:(NSNumber * _Nonnull) isEnabled)
{
    [P24SdkConfig setCertificatePinningEnabled:[isEnabled boolValue]];
}

RCT_EXPORT_METHOD(startTrnRequestWithParams:(NSDictionary*)params callback:(RCTResponseSenderBlock)callback)
{
    if (p24Handler) {
        NSLog(@"p24Handler != nil (already opened)");
        return;
    }

    p24Handler = [P24ProtocolHandler new];
    p24Handler.rctCallback = callback;
    P24TrnRequestParams* trnParams = [[P24TrnRequestParams alloc] initWithToken:params[@"token"]];
    trnParams.sandbox = [params[@"isSandbox"] boolValue];

    dispatch_sync(dispatch_get_main_queue(), ^{
        [P24 startTrnRequest:trnParams inViewController:[Przelewy24Payment visibleViewController] delegate:p24Handler];
    });
}

RCT_EXPORT_METHOD(startTrnDirectWithParams:(NSDictionary*)params callback:(RCTResponseSenderBlock)callback)
{
    if (p24Handler) {
        NSLog(@"p24Handler != nil (already opened)");
        return;
    }

    NSLog(@"\n\nLoop through params provided by user APP\n---");
    for (NSString *k in params[@"transactionParams"]) {
        NSLog(@"%@ = %@", k, params[@"transactionParams"][k]);
    }

    p24Handler = [P24ProtocolHandler new];
    p24Handler.rctCallback = callback;

    P24TransactionParams* transaction = [Przelewy24Payment transactionParams:params[@"transactionParams"]];

    P24TrnDirectParams* trnParams = [[P24TrnDirectParams alloc] initWithTransactionParams:transaction];
    trnParams.sandbox = [params[@"isSandbox"] boolValue];

    // UINavigationController *vc = [UINavigationController alloc];
    // vc.modalPresentationStyle = UIModalPresentationFullScreen;
    // UIViewController *vc = [Przelewy24Payment rootViewController];
    // OR old one:
    UIViewController *vc = [Przelewy24Payment visibleViewController];

    vc.modalPresentationStyle = UIModalPresentationFullScreen;

    // if (@available(iOS 13.0, *)) {
    //     vc.modalInPresentation = NO;
    // }

    dispatch_sync(dispatch_get_main_queue(), ^{
        [P24 startTrnDirect:trnParams inViewController:vc delegate:p24Handler];
    });
}

RCT_EXPORT_METHOD(startExpressWithParams:(NSDictionary*)params callback:(RCTResponseSenderBlock)callback)
{
    if (p24Handler) {
        NSLog(@"p24Handler != nil (already opened)");
        return;
    }

    p24Handler = [P24ProtocolHandler new];
    p24Handler.rctCallback = callback;

    P24ExpressParams* express = [[P24ExpressParams alloc] initWithUrl:params[@"url"]];

    dispatch_sync(dispatch_get_main_queue(), ^{
        [P24 startExpress:express inViewController:[Przelewy24Payment visibleViewController] delegate:p24Handler];
    });
}

- (BOOL) canMakeApplePayPayments {
    if (@available(iOS 10.0, *)) {
      return [PKPaymentAuthorizationController canMakePayments];
    } else {
      return NO;
    }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(canMakeApplePayPaymentsSync)
{
    return @([self canMakeApplePayPayments]);
}

RCT_EXPORT_METHOD(canMakeApplePayPayments:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(@([self canMakeApplePayPayments]));
}

RCT_EXPORT_METHOD(dismissApplePay:(RCTResponseSenderBlock)callback)
{
    dispatch_sync(dispatch_get_main_queue(), ^{
        [[Przelewy24Payment visibleViewController] dismissViewControllerAnimated:YES completion:nil];
    });
}

RCT_EXPORT_METHOD(finishApplePay:(NSString*)p24token)
{
    dispatch_sync(dispatch_get_main_queue(), ^{
        NSLog(@"Timestamp before RCT finishApplePay: %f", [[NSDate date] timeIntervalSince1970]);
        [Przelewy24Payment finishApplePay:p24token];
        NSLog(@"Timestamp after RCT finishApplePay: %f", [[NSDate date] timeIntervalSince1970]);
    });
}

RCT_EXPORT_METHOD(startApplePay:(NSDictionary*)params callback:(RCTResponseSenderBlock)callback callback2:(RCTResponseSenderBlock)callback2)
{
    if (p24ApplePayHandler) {
        NSLog(@"p24ApplePayHandler != nil (already opened)");
        return;
    }

    NSLog(@"\n\nApple Pay: Loop through params provided by user APP\n---");
    for (NSString *k in params) {
        NSLog(@"%@ = %@", k, params[k]);
    }

    // if ([PKPaymentAuthorizationViewController canMakePayments]) {
    //     NSLog(@"Can Make Payments");
    // } else {
    //     NSLog(@"Can't Make payments");
    // }

    p24ApplePayHandler = [P24ApplePayProtocolHandler new];
    p24ApplePayHandler.rctCallback = callback;

    p24ApplePayRegisterHandler = [P24ApplePayRegistrarProtocolHandler new];
    p24ApplePayRegisterHandler.rctCallback2 = callback2;
    // p24ApplePayOnTokenCallback = callback2;

// ORIGINAL SWIFT CODE EXAMPLE START
    // let params = P24ApplePayParams.init(
    //   appleMerchantId: "merchant.Przelewy24.sandbox",
    //   amount: 1,
    //   currency: "PLN",
    //   description: "Test transaction",
    //   registrar: self
    // )
    //
    // P24.startApplePay(params, in: self, delegate: self)
// ORIGINAL SWIFT CODE EXAMPLE END

    P24ApplePayParams* apParams = [[P24ApplePayParams alloc] init];
    // P24ApplePayTransactionRegistrar* apRegistrar = [[P24ApplePayTransactionRegistrar alloc] init];

    // required
    apParams.appleMerchantId = params[@"appleMerchantId"];
    apParams.currency = params[@"currency"];
    // apParams.amount = [params[@"amount"] intValue];
    apParams.description = params[@"description"];
    apParams.registrar = self;

    // items are required. If no provided, create from amount and description
    if ([params valueForKey:@"items"] != nil) {
        NSArray *items = [params valueForKeyPath:@"items"];
        NSMutableArray* apItems = [[NSMutableArray alloc] init];

        for (int i = 0; i < [items count]; i++) {
            NSDictionary *element = [items objectAtIndex:i];
            PaymentItem* item = [[PaymentItem alloc] init];
            item.amount = [element[@"amount"] intValue];
            item.itemDescription = element[@"itemDescription"];

            [apItems addObject:item];
        }

        apParams.items = apItems;
    } else {
        PaymentItem* item1 = [[PaymentItem alloc] init];
        item1.amount = [params[@"amount"] intValue];
        item1.itemDescription = params[@"description"];
        NSArray *items = @[item1];

        apParams.items = items;
    }

    NSLog(@"ApplePay params.items:\n\t%@", apParams.items);

    // optional
    apParams.sandbox = [params[@"isSandbox"] boolValue];
    apParams.fullScreen = [params[@"fullScreen"] boolValue];

    // UIViewController *vc = [PKPaymentAuthorizationController init];
    UIViewController *vc = [Przelewy24Payment visibleViewController];

    dispatch_sync(dispatch_get_main_queue(), ^{
        NSLog(@"Timestamp before startApplePay: %f", [[NSDate date] timeIntervalSince1970]);
        [P24 startApplePay:apParams inViewController:vc delegate:p24ApplePayHandler];
        NSLog(@"Timestamp after startApplePay: %f", [[NSDate date] timeIntervalSince1970]);
    });
}

+ (P24TransactionParams*) transactionParams: (NSDictionary*) params {
    P24TransactionParams* transaction = [P24TransactionParams new];

    // required
    transaction.merchantId = [params[@"merchantId"] intValue];
    transaction.crc = params[@"crc"];
    transaction.sessionId = params[@"sessionId"];
    transaction.amount = [params[@"amount"] intValue];
    transaction.currency = params[@"currency"];
    transaction.desc = params[@"description"];
    transaction.email = params[@"email"];
    transaction.country = params[@"country"];

    // optional
    transaction.client = params[@"client"];
    transaction.address = params[@"address"];
    transaction.zip = params[@"zip"];
    transaction.city = params[@"city"];
    transaction.phone = params[@"phone"];
    transaction.language = params[@"language"];
    transaction.method = [params[@"method"] intValue];
    transaction.urlStatus = params[@"urlStatus"];
    transaction.timeLimit = [params[@"timeLimit"] intValue];
    transaction.channel = [params[@"channel"] intValue];
    transaction.shipping = [params[@"shipping"] intValue];
    transaction.transferLabel = params[@"transferLabel"];

    if ([params valueForKey:@"passageCart"] != nil) {
        [self setPassageCart:transaction params:params];
    }

    return transaction;
}

+ (void) setPassageCart: (P24TransactionParams*) transaction params: (NSDictionary*) params {
    P24PassageCart* passageCart = [P24PassageCart new];

    NSArray *items = [params valueForKeyPath:@"passageCart"];

    for (int i = 0; i < [items count]; i++) {
        NSDictionary *element = [items objectAtIndex:i];

        P24PassageItem* item = [[P24PassageItem alloc] initWithName:[element valueForKey:@"name"]];
        item.desc = [element valueForKey:@"description"];
        item.quantity = [[element valueForKey:@"quantity"] intValue];
        item.price = [[element valueForKey:@"price"] intValue];
        item.number = [[element valueForKey:@"number"] intValue];
        item.targetAmount = [[element valueForKey:@"targetAmount"] intValue];
        item.targetPosId = [[element valueForKey:@"targetPosId"] intValue];

        [passageCart addItem:item];
    }

    transaction.amount = [[params valueForKey:@"amount"] intValue];
    transaction.passageCart = passageCart;
}

+ (void) paymentClosed {
    p24Handler = nil;
    NSLog(@"\n\nP24 PAYMENT CLOSED\n\n");
}

+ (void) applePayPaymentClosed {
    p24ApplePayHandler = nil;
    p24ApplePayRegisterHandler = nil;
    NSLog(@"\n\nP24 APPLEPAY PAYMENT CLOSED\n\n");
    NSLog(@"Timestamp after closed: %f", [[NSDate date] timeIntervalSince1970]);
}

RCT_EXPORT_METHOD(clear)
{
    [Przelewy24Payment paymentClosed];
    [Przelewy24Payment applePayPaymentClosed];
}

- (void) exchange: (NSString*) applePayToken delegate: (id<P24ApplePayTransactionRegistrarDelegate>) delegate {
    NSLog(@"Timestamp before exchange: %f", [[NSDate date] timeIntervalSince1970]);
    NSLog(@"ApplePay exchange applePayToken = %@", applePayToken);
    [p24ApplePayRegisterHandler onRegisterStart:applePayToken delegate:delegate];
    NSLog(@"Timestamp after exchange: %f", [[NSDate date] timeIntervalSince1970]);
}

+ (void) finishApplePay: (NSString*) p24token {
    NSLog(@"Timestamp before finishApplePay: %f", [[NSDate date] timeIntervalSince1970]);
    [p24ApplePayRegisterHandler onRegisterSuccess:p24token];
    NSLog(@"Timestamp after finishApplePay: %f", [[NSDate date] timeIntervalSince1970]);
}

+ (UIViewController*) rootViewController {
    return [[[[UIApplication sharedApplication] delegate] window] rootViewController];
}

+ (UIViewController*) visibleViewController {
    UIViewController *visibleVC = [[[[UIApplication sharedApplication] delegate] window] rootViewController];

    do {
        if ([visibleVC isKindOfClass:[UINavigationController class]]) {
            visibleVC = [(UINavigationController *)visibleVC visibleViewController];
        } else if (visibleVC.presentedViewController) {
            visibleVC = visibleVC.presentedViewController;
        }
    } while (visibleVC.presentedViewController);

    return visibleVC;
}

@end
