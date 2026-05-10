import hashlib
import hmac
import json
import uuid

import requests
from decouple import config


MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"


def _sign(raw_signature: str) -> str:
    secret_key = config("MOMO_SECRET_KEY", default="")
    return hmac.new(
        secret_key.encode("utf-8"),
        raw_signature.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def create_payment(order_number, amount, order_info, return_url, notify_url, ip_addr):
    partner_code = config("MOMO_PARTNER_CODE", default="")
    access_key = config("MOMO_ACCESS_KEY", default="")
    request_id = f"{order_number}-{uuid.uuid4().hex[:12]}"
    order_id = order_number
    amount_value = str(int(amount))
    extra_data = ""
    request_type = "captureWallet"

    raw_signature = (
        f"accessKey={access_key}"
        f"&amount={amount_value}"
        f"&extraData={extra_data}"
        f"&ipnUrl={notify_url}"
        f"&orderId={order_id}"
        f"&orderInfo={order_info}"
        f"&partnerCode={partner_code}"
        f"&redirectUrl={return_url}"
        f"&requestId={request_id}"
        f"&requestType={request_type}"
    )

    payload = {
        "partnerCode": partner_code,
        "partnerName": "Duoc Mua",
        "storeId": "DuocMuaStore",
        "requestId": request_id,
        "amount": amount_value,
        "orderId": order_id,
        "orderInfo": order_info,
        "redirectUrl": return_url,
        "ipnUrl": notify_url,
        "lang": "vi",
        "requestType": request_type,
        "autoCapture": True,
        "extraData": extra_data,
        "signature": _sign(raw_signature),
    }

    response = requests.post(
        MOMO_ENDPOINT,
        data=json.dumps(payload),
        headers={"Content-Type": "application/json"},
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("payUrl") or data.get("deeplink") or data.get("qrCodeUrl")


def verify_ipn(params):
    data = dict(params)
    received_signature = str(data.pop("signature", ""))
    signed_keys = [
        "accessKey",
        "amount",
        "extraData",
        "message",
        "orderId",
        "orderInfo",
        "orderType",
        "partnerCode",
        "payType",
        "requestId",
        "responseTime",
        "resultCode",
        "transId",
    ]
    raw_signature = "&".join(
        f"{key}={data.get(key, '')}"
        for key in signed_keys
    )
    expected_signature = _sign(raw_signature)
    return hmac.compare_digest(received_signature.lower(), expected_signature.lower())
