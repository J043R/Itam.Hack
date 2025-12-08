import asyncio
from typing import Optional
from loguru import logger
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from sqlalchemy.ext.asyncio import AsyncSession

from settings.settings import settings
from services.login_code_service import LoginCodeService
from infrastructure.db.connection import connection


class TelegramBotService:
    def __init__(self):
        self.bot_token = settings.telegram.bot_token
        self.application: Optional[Application] = None
        self.db_session: Optional[AsyncSession] = None

    async def initialize_db(self):
        async_session_maker = connection()
        self.db_session = async_session_maker()

    async def close_db(self):
        if self.db_session:
            await self.db_session.close()

    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        welcome_message = (
            f"Привет, {user.first_name}! 👋\n\n"
            "Я бот для входа в платформу хакатонов.\n"
            "Напиши мне любое сообщение, и я выдам тебе код для входа.\n\n"
            "Или используй команду /code для получения кода."
        )
        await update.message.reply_text(welcome_message)

    async def code_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /code - генерирует код входа"""
        await self.generate_and_send_code(update)

    async def message_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик обычных сообщений - генерирует код входа"""
        await self.generate_and_send_code(update)

    async def generate_and_send_code(self, update: Update):
        """Генерирует код и отправляет его пользователю"""
        user = update.effective_user
        
        try:
            async_session_maker = connection()
            async with async_session_maker() as db_session:
                code_service = LoginCodeService(db_session)
                
                code = await code_service.create_code(
                    telegram_id=str(user.id),
                    telegram_username=user.username,
                    first_name=user.first_name,
                    last_name=user.last_name
                )
                
                message = (
                    f"🔐 Ваш код для входа:\n\n"
                    f"**{code}**\n\n"
                    f"Код действителен 10 минут.\n"
                    f"Введите его в приложении для входа."
                )
                
                await update.message.reply_text(message, parse_mode='Markdown')
                logger.info(f"Generated login code for user {user.id} ({user.username})")
            
        except Exception as e:
            logger.error(f"Error generating code for user {user.id}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            await update.message.reply_text(
                "❌ Произошла ошибка при генерации кода. Попробуйте позже."
            )

    async def setup_bot(self):
        """Настройка и запуск бота"""
        if not self.bot_token:
            logger.warning("Telegram bot token not configured. Bot will not start.")
            return

        self.application = Application.builder().token(self.bot_token).build()

        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("code", self.code_command))
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.message_handler))

        logger.info("Telegram bot initialized")

    async def start_polling(self):
        """Запуск бота в режиме polling"""
        if not self.application:
            await self.setup_bot()
        
        if self.application:
            logger.info("Starting Telegram bot polling...")
            await self.application.initialize()
            await self.application.start()
            await self.application.updater.start_polling()
            logger.info("Telegram bot is running")

    async def stop_polling(self):
        """Остановка бота"""
        if self.application:
            try:
                await self.application.updater.stop()
                await self.application.stop()
                await self.application.shutdown()
            except Exception as e:
                logger.error(f"Error stopping bot: {e}")
        await self.close_db()
        logger.info("Telegram bot stopped")


telegram_bot = TelegramBotService()


async def start_telegram_bot():
    """Функция для запуска бота (используется в main.py)"""
    await telegram_bot.start_polling()


async def stop_telegram_bot():
    """Функция для остановки бота"""
    await telegram_bot.stop_polling()

