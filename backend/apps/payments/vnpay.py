import hashlib
import hmac
from datetime import timedelta
from urllib.parse import quote_plus, urlencode

from decouple import config
from django.utils import timezone


VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"


def _build_hash_data(params: dict) -> str:
    return "&".join(
        f"{quote_plus(str(key))}={quote_plus(str(params[key]))}"
        for key in sorted(params)
        if params[key] not in (None, "")
    )


def _secure_hash(params: dict) -> str:
    secret = config("VNPAY_HASH_SECRET", default="")
    hash_data = _build_hash_data(params)
    return hmac.new(
        secret.encode("utf-8"),
        hash_data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()


def create_payment_url(order_number, amount, order_info, return_url, ip_addr):
    now = timezone.localtime()
    params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": config("VNPAY_TMN_CODE", default=""),
        "vnp_Amount": int(amount) * 100,
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": order_number,
        "vnp_OrderInfo": order_info,
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": return_url,
        "vnp_IpAddr": ip_addr,
        "vnp_CreateDate": now.strftime("%Y%m%d%H%M%S"),
        "vnp_ExpireDate": (now + timedelta(minutes=15)).strftime("%Y%m%d%H%M%S"),
    }
    params["vnp_SecureHash"] = _secure_hash(params)
    return f"{VNPAY_URL}?{urlencode(params, quote_via=quote_plus)}"


def verify_return(params):
    data = dict(params)
    received_hash = data.pop("vnp_SecureHash", "")
    data.pop("vnp_SecureHashType", None)
    expected_hash = _secure_hash(data)
    return hmac.compare_digest(str(received_hash).lower(), expected_hash.lower())
