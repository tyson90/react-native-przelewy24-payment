package com.tsn_p24.reactNative;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import pl.przelewy24.p24lib.settings.SdkConfig;
import pl.przelewy24.p24lib.transfer.TransferActivity;
import pl.przelewy24.p24lib.transfer.TransferResult;
import pl.przelewy24.p24lib.transfer.direct.TransactionParams;
import pl.przelewy24.p24lib.transfer.direct.TrnDirectParams;
import pl.przelewy24.p24lib.transfer.express.ExpressParams;
import pl.przelewy24.p24lib.transfer.passage.PassageCart;
import pl.przelewy24.p24lib.transfer.passage.PassageItem;
import pl.przelewy24.p24lib.transfer.request.TrnRequestParams;

import static android.app.Activity.RESULT_OK;

// import pl.przelewy24.p24lib.card.CardData;
// import pl.przelewy24.p24lib.card.RegisterCardActivity;
// import pl.przelewy24.p24lib.card.RegisterCardParams;
// import pl.przelewy24.p24lib.card.RegisterCardResult;
// import pl.przelewy24.p24lib.google_pay.GooglePayActivity;
// import pl.przelewy24.p24lib.google_pay.GooglePayParams;
// import pl.przelewy24.p24lib.google_pay.GooglePayResult;
// import pl.przelewy24.p24lib.google_pay.GooglePayTransactionRegistrar;

public class Przelewy24PaymentModule  extends ReactContextBaseJavaModule implements ActivityEventListener {

    // private final ReactApplicationContext reactContext;
    private static final int P24_ACTIVITY_CODE = 1001;
    private Promise promise;

    public Przelewy24PaymentModule(ReactApplicationContext reactContext) {
        super(reactContext);

        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "RNPrzelewy24Payment";
    }

    @ReactMethod
    public void setCertificatePinningEnabled(boolean isEnabled) {
        SdkConfig.setCertificatePinningEnabled(isEnabled);
    }

    @ReactMethod
    public void startTrnRequest(ReadableMap trnRequestParams, Promise promise) {
        this.promise = promise;

        TrnRequestParams params = TrnRequestParams.create(trnRequestParams.getString("token"))
                .setSandbox(trnRequestParams.getBoolean("isSandbox"));

        Intent intent = TransferActivity.getIntentForTrnRequest(getCurrentActivity(), params);
        Activity currentActivity = getCurrentActivity();
        currentActivity.startActivityForResult(intent, P24_ACTIVITY_CODE);
    }

    @ReactMethod
    public void startTrnDirect(ReadableMap trnDirectParams, Promise promise) {
        this.promise = promise;

        TrnDirectParams params = TrnDirectParams.create(getPaymentParams(trnDirectParams.getMap("transactionParams")))
                .setSandbox(trnDirectParams.getBoolean("isSandbox"));

        Intent intent = TransferActivity.getIntentForTrnDirect(getCurrentActivity(), params);
        getCurrentActivity().startActivityForResult(intent, P24_ACTIVITY_CODE);
    }

    @ReactMethod
    public void startExpress(ReadableMap expressParams, Promise promise) {
        this.promise = promise;

        ExpressParams params = ExpressParams.create(expressParams.getString("url"));

        Intent intent = TransferActivity.getIntentForExpress(getCurrentActivity(), params);
        getCurrentActivity().startActivityForResult(intent, P24_ACTIVITY_CODE);
    }

    private TransactionParams getPaymentParams(ReadableMap map) {
        TransactionParams.Builder builder = new TransactionParams.Builder()
            // required
            .merchantId(map.getInt("merchantId"))
            .crc(map.getString("crc"))
            .sessionId(map.getString("sessionId"))
            .amount(map.getInt("amount"))
            .currency(map.getString("currency"))
            .description(map.getString("description"))
            .email(map.getString("email"))
            .country(map.getString("country"))
            // in iOS these are optional
            .client(map.getString("client"))
            .address(map.getString("address"))
            .zip(map.getString("zip"))
            .city(map.getString("city"))
            .phone(map.getString("phone"))
            .language(map.getString("language"))
        ;

        // optional
        if (map.hasKey("method")) {
            builder.method(map.getInt("method"));
        }

        if (map.hasKey("urlStatus")) {
            builder.urlStatus(map.getString("urlStatus"));
        }

        if (map.hasKey("timeLimit")) {
            builder.timeLimit(map.getInt("timeLimit"));
        }

        if (map.hasKey("channel")) {
            builder.channel(map.getInt("channel"));
        }

        if (map.hasKey("shipping")) {
            builder.shipping(map.getInt("shipping"));
        }

        if (map.hasKey("transferLabel")) {
            builder.transferLabel(map.getString("transferLabel"));
        }


        if (map.hasKey("passageCart")) {
            ReadableArray items = map.getArray("passageCart");
            PassageCart passageCart = PassageCart.create();

            for (int i = 0; i < items.size(); i++) {
                ReadableMap item = items.getMap(i);
                PassageItem.Builder itemBuilder = new PassageItem.Builder();

                itemBuilder.name(item.getString("name"));
                itemBuilder.description(item.getString("description"));
                itemBuilder.quantity(item.getInt("quantity"));
                itemBuilder.price(item.getInt("price"));
                itemBuilder.number(item.getInt("number"));
                itemBuilder.targetAmount(item.getInt("targetAmount"));
                itemBuilder.targetPosId(item.getInt("targetPosId"));

                passageCart.addItem(itemBuilder.build());
            }

            builder.amount(map.getInt("amount"));
            builder.passageCart(passageCart);
        }

        return builder.build();
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode == P24_ACTIVITY_CODE && promise != null) {
            WritableMap map = Arguments.createMap();

            if (resultCode == RESULT_OK) {
                TransferResult result = TransferActivity.parseResult(data);

                if (result.isSuccess()) {
                    map.putBoolean("isSuccess", true);
                } else {
                    map.putString("errorCode", result.getErrorCode());
                }
            } else {
                map.putBoolean("isCanceled", true);
            }

            promise.resolve(map);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {

    }
}
