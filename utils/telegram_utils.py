import hashlib
import hmac
from typing import Optional, Dict, Any
from loguru import logger


def verify_telegram_auth(data: Dict[str, Any], bot_token: str) -> bool:
    """
    Проверка подписи данных от Telegram Web App
    
    Args:
        data: Словарь с данными от Telegram (initData)
        bot_token: Токен бота от Telegram
        
    Returns:
        True если подпись верна, False иначе
    """
    try:
        # Получаем хеш из данных
        received_hash = data.get("hash", "")
        if not received_hash:
            return False
        
        # Удаляем хеш из данных для проверки
        data_copy = {k: v for k, v in data.items() if k != "hash"}
        
        # Сортируем ключи
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(data_copy.items())
        )
        
        # Создаем секретный ключ
        secret_key = hmac.new(
            "WebAppData".encode(),
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Вычисляем хеш
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Сравниваем хеши
        return calculated_hash == received_hash
        
    except Exception as e:
        logger.error(f"Error verifying Telegram auth: {e}")
        return False


def parse_init_data(init_data: str) -> Optional[Dict[str, Any]]:
    """
    Парсинг initData строки от Telegram
    
    Args:
        init_data: Строка initData от Telegram Web App
        
    Returns:
        Словарь с распарсенными данными или None
    """
    try:
        result = {}
        for pair in init_data.split("&"):
            if "=" in pair:
                key, value = pair.split("=", 1)
                result[key] = value
        return result
    except Exception as e:
        logger.error(f"Error parsing init_data: {e}")
        return None


def verify_telegram_webapp_data(init_data: str, bot_token: str) -> bool:
    """
    Полная проверка данных от Telegram Web App
    
    Args:
        init_data: Строка initData от Telegram
        bot_token: Токен бота
        
    Returns:
        True если данные валидны, False иначе
    """
    parsed_data = parse_init_data(init_data)
    if not parsed_data:
        return False
    
    return verify_telegram_auth(parsed_data, bot_token)


def extract_user_data(init_data: str) -> Optional[Dict[str, Any]]:
    """
    Извлечение данных пользователя из initData
    
    Args:
        init_data: Строка initData от Telegram
        
    Returns:
        Словарь с данными пользователя или None
    """
    try:
        import urllib.parse
        import json
        
        parsed = parse_init_data(init_data)
        if not parsed:
            return None
        
        user_str = parsed.get("user", "")
        if not user_str:
            return None
        
        # Декодируем URL-encoded строку
        user_decoded = urllib.parse.unquote(user_str)
        user_data = json.loads(user_decoded)
        
        return user_data
        
    except Exception as e:
        logger.error(f"Error extracting user data: {e}")
        return None

