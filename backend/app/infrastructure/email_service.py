"""Adaptador de infraestructura para envío de correos electrónicos."""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app

logger = logging.getLogger(__name__)


def send_email(
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str | None = None,
) -> None:
    """Envía un correo vía SMTP o registra el contenido en log si no hay servidor configurado."""
    mail_server = current_app.config.get("MAIL_SERVER", "")
    sender = current_app.config.get("MAIL_DEFAULT_SENDER", "noreply@projectbridge.local")

    if not mail_server:
        logger.warning(
            "[EMAIL DEV - NO SMTP CONFIGURED] To: %s | Subject: %s\n%s",
            to_email,
            subject,
            text_body,
        )
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = to_email
    message.attach(MIMEText(text_body, "plain", "utf-8"))

    if html_body:
        message.attach(MIMEText(html_body, "html", "utf-8"))

    port = current_app.config.get("MAIL_PORT", 587)
    username = current_app.config.get("MAIL_USERNAME", "")
    password = current_app.config.get("MAIL_PASSWORD", "")
    use_tls = current_app.config.get("MAIL_USE_TLS", True)

    with smtplib.SMTP(mail_server, port, timeout=10) as server:
        if use_tls:
            server.starttls()
        if username and password:
            server.login(username, password)
        server.sendmail(sender, [to_email], message.as_string())