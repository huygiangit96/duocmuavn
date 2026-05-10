class LangMixin:
    """Mixin cho serializer để trả field đúng ngôn ngữ."""

    def get_lang(self):
        request = self.context.get("request")
        if request:
            return request.query_params.get("lang", "vi")
        return "vi"

    def localized(self, obj, field_vi, field_en=None):
        """Trả field tiếng Anh nếu lang=en và field_en không trống."""
        if self.get_lang() == "en" and field_en:
            val = getattr(obj, field_en, "")
            if val:
                return val
        return getattr(obj, field_vi, "")
